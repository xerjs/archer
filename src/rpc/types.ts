import { z } from 'zod'
export interface MethodInfo {
    res: unknown
    pars: unknown[]
    name: string
    path: string
    instance: unknown
    types: z.AnyZodTuple
}

export interface ApiInfo {
    res: unknown
    pars: unknown[]
    inject: ApiParam[]
    name: string
    path: string
    instance: unknown
    method: string
}

export interface ApiParam {
    from: string
    key: string
}

export type RpcOpt = {
    trans: string
    path: string
}

export type FunOpt = {
    path: string
    types: z.AnyZodTuple
}

export type ApiOpt = {
    method: string
    path: string
    desc?: string
}
