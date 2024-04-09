import { ZodError } from 'zod'

export * from './obj'
export { format } from 'util'

type Logger = (format: string, ...param: any[]) => string

export const koaLogger: Logger = require('debug')('Koa')

export function firstZodError(err: ZodError): [string, string] {
    for (const [i, msg] of Object.entries(err.formErrors.fieldErrors)) {
        const [s] = msg!
        return [i, s]
    }
    return ['', '']
}

export function ErrorWithCode(code: number, msg: string) {
    const e = new Error(msg)
    Object.assign(e, { code })
    return e
}
