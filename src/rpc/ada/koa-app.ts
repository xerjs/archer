import { Provider } from '@xerjs/avalon'
import Koa from 'koa'
import Router from 'koa-router'
import { ApiInfo, MethodInfo, RenderOpt } from '../types'
import * as _ from '../../utils'
import { koaLogger } from '../../utils'
import bodyParser from 'koa-bodyparser'

type ResBody = {
    code: number
    data?: unknown
    message?: string
}

export class RcpError extends Error {
    constructor(public readonly code: number, message: string) {
        super(message)
    }
}

const onBody = bodyParser()
const onErr: Koa.Middleware = async (ctx, next) => {
    try {
        await next()
        if (typeof ctx.body !== 'undefined') {
            ctx.status = 200
        }
    } catch (error) {
        const err = error as RcpError
        const resBody: ResBody = {
            code: err.code || 500,
            message: err.message,
        }
        ctx.body = resBody
        ctx.status = 200
    }

    koaLogger('%s %s %s', ctx.method, ctx.routerPath, ctx.url)
}

@Provider()
export class KoaAdapter {
    createRouter(infos: MethodInfo[]) {
        const router = new Router()
        router.use(onErr, onBody)
        for (const inf of infos) {
            const ware: Koa.Middleware = async (ctx) => {
                let method: Function | undefined
                if (inf.instance) {
                    method = _.get<Function>(inf.instance, inf.name)
                }
                if (!method) {
                    throw new Error(`Method ${inf.path} not implemented.`)
                }

                const args = this.pickBody(ctx.request.body, inf)
                const data = await method.call(inf.instance, ...args)
                if (typeof data === 'undefined') {
                    throw new Error(`Method ${inf.path} result is undefined.`)
                }
                ctx.body = { code: 200, data } as ResBody
            }
            router.post(inf.path, ware)
        }

        return router
    }

    createApp() {
        const app = new Koa()
        app.use(onErr)
        return app
    }

    createEmptyRouter() {
        return new Router().use(onBody)
    }

    registerRouter(router: Router, infos: ApiInfo[]): void {
        const acts = new Set('get|post|put|patch|delete'.split('|'))
        for (const inf of infos) {
            const ware = this.getWare(inf)
            const act = acts.has(inf.method) && _.get(router, inf.method)
            if (!act) {
                throw new Error(`Method ${inf.method} ${inf.path} not implemented.`)
            }
            router
            act.call(router, inf.path, ware)
        }
    }

    getWare(inf: ApiInfo): Koa.Middleware {
        const ware: Koa.Middleware = async (ctx) => {
            let method: Function | undefined
            if (inf.instance) {
                method = _.get<Function>(inf.instance, inf.name)
            }
            if (!method) {
                throw new Error(`Method ${inf.name} path ${inf.path} not implemented.`)
            }

            let data
            if (inf.inject) {
                const val: unknown[] = []
                for (let ii = 0; ii < inf.inject.length; ii++) {
                    const inj = inf.inject[ii]
                    val[ii] = this.pickCtx(ctx, inj.from, inj.key)
                    if (typeof inj.convert === 'function') {
                        val[ii] = inj.convert(val[ii])
                    }
                }
                data = await method.call(inf.instance, ...val)
            } else {
                data = await method.call(inf.instance)
            }

            if (typeof data === 'undefined') {
                throw new Error(`Method ${inf.path} result is undefined.`)
            }
            this.ctxBody(ctx, data, inf.render)
        }

        return ware
    }

    ctxBody(ctx: Koa.Context, data: any, render: RenderOpt) {
        if (!render) {
            ctx.body = { code: 200, data } as ResBody
            return
        }
        if (render.as === 'text') {
            ctx.body = data
        }
    }

    pickBody(body: any, info: MethodInfo) {
        const { args } = body
        if (!Array.isArray(args)) {
            throw new Error(`Expected body.args is array`)
        }
        if (info.pars.length !== args.length) {
            throw new Error(
                `Expected ${info.pars.length} arguments of ${info.name}, but got ${args.length}.`,
            )
        }

        if (info.types) {
            const res = info.types.safeParse(args)
            if (!res.success) {
                const [i, s] = _.firstZodError(res.error)
                throw new Error(`${s} @args ${i}`)
            }
        }
        return args
    }

    pickCtx(ctx: Koa.Context, from: string, key: string): unknown {
        let source: any
        if (from === 'param') {
            source = ctx.params
        } else if (from === 'query') {
            source = ctx.query
        } else if (from === 'header') {
            source = ctx.header
        } else if (from === 'body') {
            source = ctx.request.body
        } else {
            throw new Error(`Unknown ctx from ${from}`)
        }
        if (!key || key === '.') return source
        return _.get(source, key)
    }
}
