import { MetaUtil } from '@xerjs/avalon'
import { z } from 'zod'
import { FunOpt, RpcOpt, ApiOpt, ApiArg, ApiArgConvert } from './types'
import * as _ from '../utils'

export const rpcMeta = new MetaUtil('archer.rpc')

export const rpc = rpcMeta.classDecorator<Partial<RpcOpt>>((x) => {
    x = x || {}
    x.trans = x.trans || 'axios'
    Object.freeze(x)
    return x
})

export const rpcFun = rpcMeta.propertyDecorator<Partial<FunOpt>>((x) => {
    x = x || {}
    Object.freeze(x)
    return x
})

export const apiMeta = new MetaUtil('archer.api')

export const apiFun = apiMeta.methodDecorator<ApiOpt>((x) => {
    Object.freeze(x)
    return x
})

export const apiPost = apiMeta.methodDecorator<string>((path) => {
    return { method: 'post', path } as ApiOpt
})

export const apiGet = apiMeta.methodDecorator<string>((path) => {
    return { method: 'get', path } as ApiOpt
})

function setArg(arg: ApiArg) {
    const fn: ParameterDecorator = (target, propertyKey, parameterIndex) => {
        let params = Reflect.getMetadata(apiMeta.proKey + '.param', target, propertyKey)
        if (!params) {
            params = []
        }
        params[parameterIndex] = arg
        Reflect.defineMetadata(apiMeta.proKey + '.param', params, target, propertyKey)
    }
    return fn
}

const fromVal = {
    param: 'param',
    query: 'query',
    body: 'body',
    header: 'header',
}

export const fromHeader = (key: string = '.') => {
    return setArg({ from: fromVal.header, key })
}

export const fromParam = (key: string, convert?: ApiArgConvert) => {
    return setArg({ from: fromVal.param, key, convert })
}

fromParam.int = (key: string) => {
    return setArg({
        from: fromVal.param,
        key,
        convert: (v) => {
            const rs = parseInt(v) || v
            const ok = z.number().safeParse(rs)
            if (!ok.success) {
                const msg = _.format('%s.%s: %s', fromVal.param, key, ok.error.errors[0].message)
                throw _.ErrorWithCode(40000, msg)
            }
            return rs
        },
    })
}

fromParam.float = (key: string) => {}

export const fromQuery = (key: string) => {
    return setArg({ from: fromVal.query, key })
}

export const fromBody = (key: string = '.') => {
    return setArg({ from: fromVal.body, key })
}

export function resolveParam(target: any, propertyKey: string): ApiArg[] {
    const item = typeof target === 'function' ? target.prototype : target
    return Reflect.getMetadata(apiMeta.proKey + '.param', item, propertyKey)
}
