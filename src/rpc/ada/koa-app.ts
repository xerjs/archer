import { Provider } from '@xerjs/avalon'
import Koa from 'koa'
import Router from 'koa-router'
import { ApiInfo, MethodInfo } from '../types'
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
        ctx.status = 200
        await next()
    } catch (error) {
        const err = error as RcpError
        koaLogger('%j', err)
        const resBody: ResBody = {
            code: err.code || 500,
            message: err.message,
        }
        ctx.body = resBody
    }
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
        return new Koa()
    }

    createEmptyRouter() {
        return new Router().use(onErr, onBody)
    }

    registerRouter(router: Router, infos: ApiInfo[]) {
        for (const inf of infos) {
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
                    }

                    data = await method.call(inf.instance, ...val)
                } else {
                    data = await method.call(inf.instance)
                }

                if (typeof data === 'undefined') {
                    throw new Error(`Method ${inf.path} result is undefined.`)
                }
                ctx.body = { code: 200, data } as ResBody
            }
            if (inf.method === 'get') {
                router.get(inf.path, ware)
            } else if (inf.method === 'post') {
                router.post(inf.path, ware)
            } else {
                throw new Error(`Method ${inf.method} ${inf.path} not implemented.`)
            }
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
                for (const [i, msg] of Object.entries(res.error.formErrors.fieldErrors)) {
                    const [s] = msg!
                    throw new Error(`${s} @args ${i}`)
                }
            }
        }
        return args
    }

    pickCtx(ctx: Koa.Context, from: string, key: string): unknown {
        if (from === 'param') {
            return ctx.params[key]
        } else if (from === 'query') {
            return ctx.query[key]
        }

        throw new Error(`Unknown ctx from ${from}`)
    }
}
