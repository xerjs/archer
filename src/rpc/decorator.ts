import { MetaUtil } from '@xerjs/avalon'
import { FunOpt, RpcOpt, ApiOpt, ApiParam } from './types'

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

export const fromParam = (key: string) => {
    const fn: ParameterDecorator = (target, propertyKey, parameterIndex) => {
        let params = Reflect.getMetadata(apiMeta.proKey + '.param', target, propertyKey)
        if (!params) {
            params = []
        }
        params[parameterIndex] = { from: 'param', key }
        Reflect.defineMetadata(apiMeta.proKey + '.param', params, target, propertyKey)
    }
    return fn
}

export const fromQuery = (key: string) => {
    const fn: ParameterDecorator = (target, propertyKey, parameterIndex) => {
        let params = Reflect.getMetadata(apiMeta.proKey + '.param', target, propertyKey)
        if (!params) {
            params = []
        }
        params[parameterIndex] = { from: 'query', key }
        Reflect.defineMetadata(apiMeta.proKey + '.param', params, target, propertyKey)
    }
    return fn
}

export const fromBody = (key: string) => {
    const fn: ParameterDecorator = (target, propertyKey, parameterIndex) => {
        let params = Reflect.getMetadata(apiMeta.proKey + '.param', target, propertyKey)
        if (!params) {
            params = []
        }
        params[parameterIndex] = { from: 'query', key } as ApiParam
        Reflect.defineMetadata(apiMeta.proKey + '.param', params, target, propertyKey)
    }
    return fn
}

export function resolveParam(target: any, propertyKey: string): ApiParam[] {
    const item = typeof target === 'function' ? target.prototype : target
    return Reflect.getMetadata(apiMeta.proKey + '.param', item, propertyKey)
}
