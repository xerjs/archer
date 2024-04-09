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
    render: RenderOpt
    inject: ApiArg[]
    name: string
    path: string
    instance: unknown
    method: string
}

export interface ApiArg {
    from: string
    key: string
    convert?: (v: any) => any
}

export type ApiArgConvert = (v: unknown) => unknown

export type RpcOpt = {
    trans: string
    path: string
}

export type RenderOpt = {
    as: string
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
