export * from "./obj";

type Logger = (format: string, ...param: any[]) => string;

export const koaLogger: Logger = require("debug")("Koa");
