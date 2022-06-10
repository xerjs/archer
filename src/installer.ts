import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { ParOpt } from "./decorator";

const methods = new Set(["get", "post", "put", "patch", "del", "delete"]);

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
            default:
                break;
        }
    }

    middleware(instance: any, pKey: string, metaList: ParOpt[]): Router.IMiddleware {
        return async (ctx) => {
            // console.log(ctx.router);
            const params: unknown[] = [];

            metaList.forEach((meta) => {
                const fn = meta.convert || ((e: unknown) => e);
                const value = this.resolveParam({ param: ctx.params, query: ctx.query, body: ctx.request.body }, meta);
                params[meta.index] = fn(value);
            });
            const res = await instance[pKey](...params);
            ctx.body = res;
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