export class BisError extends Error {
    constructor(public code: number, msg: string) {
        super(msg)
    }
}
