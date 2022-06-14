import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { ParOpt, ResOpt } from "./decorator";

const methods = new Set(["get", "post", "put", "patch", "del"]);

type ResponsePip = (ctx: Koa.ParameterizedContext) => void;

export class Installer {
    readonly router: Router;
    constructor() {
        this.router = new Router();
    }

    setRouter(method: string, path: string, act: Router.IMiddleware) {
        if (!methods.has(method)) {
            throw new Error(`cant use method ${method}`);
        }

        switch (method) {
            case "get":
                this.router.get(path, act);
                break;
            case "post":
                this.router.post(path, act);
                break;
            case "put":
                this.router.put(path, act);
                break;
            case "patch":
                this.router.patch(path, act);
                break;
            case "del":
                this.router.del(path, act);
                break;
            default:
                break;
        }
    }

    middleware(instance: any, pKey: string, metaList: ParOpt[], pip?: ResponsePip): Router.IMiddleware {
        return async (ctx: Koa.ParameterizedContext): Promise<void> => {
            // console.log(ctx.router);
            const params: unknown[] = [];

            metaList.forEach((meta) => {
                const fn = meta.convert || ((e: unknown) => e);
                const value = this.resolveParam({ param: ctx.params, query: ctx.query, body: ctx.request.body }, meta);
                params[meta.index] = fn(value);
            });
            const res = await instance[pKey](...params);
            ctx.body = res;
            if (pip) {
                pip(ctx);
            }
        };
    }

    pipRes(metaList: ResOpt[]): ResponsePip {
        return (ctx: Koa.ParameterizedContext) => {
            const origin = ctx.body;
            for (const e of metaList) {
                if (e.act === "redirect" && e.code && typeof origin === "string") {
                    ctx.status = e.code;
                    ctx.redirect(origin);
                    return ctx.body = "";
                }
            }
        };
    }

    resolveParam(record: { param: any, query: any, body: any; }, meta: ParOpt): any {
        const data = record[meta.from];
        if (meta.key) {
            return data[meta.key];
        }
        return data;
    }

    attachTo(app: Koa) {
        app
            .use(bodyParser())
            .use(this.router.routes())
            .use(this.router.allowedMethods());
    }
}