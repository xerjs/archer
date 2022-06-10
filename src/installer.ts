import Koa from "koa";
import Router from "koa-router";

const methods = new Set(["get", "post", "put", "patch", "del", "delete"]);

export class Installer {
    readonly router: Router;
    constructor() {
        this.router = new Router();
    }

    setRouter(method: string, path: string, instance: any, pkey: string) {
        if (!methods.has(method)) {
            throw new Error(`cant use method ${method}`);
        }
        const act: Router.IMiddleware = async (ctx) => {
            // console.log(ctx.router);
            const res = await instance[pkey]();
            ctx.body = res;
        };
        switch (method) {
            case "get":
                this.router.get(path, act);
                break;
            case "post":
                this.router.get(path, act);
                break;
            default:
                break;
        }
    }

    attachTo(app: Koa) {
        app
            .use(this.router.routes())
            .use(this.router.allowedMethods());
    }
}