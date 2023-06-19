import { Provider } from "@xerjs/avalon";
import Koa from "koa";
import Router from "koa-router";
import { MethodInfo } from "../types";
import { _ } from "../..";
import { koaLogger } from "../../utils";
import bodyParser from "koa-bodyparser";

type ResBody = {
    code: number;
    data?: unknown;
    message?: string;
};

export class RcpError extends Error {
    constructor(public readonly code: number, message: string) {
        super(message);
    }
}

const onErr: Koa.Middleware = async (ctx, next) => {
    try {
        ctx.status = 200;
        await next();
    } catch (error) {
        const err = error as RcpError;
        koaLogger("%j", err);
        const resBody: ResBody = {
            code: err.code || 500,
            data: err.message,
        };
        ctx.body = resBody;
    }
};

@Provider()
export class KoaAdapter {
    createRouter(infos: MethodInfo[]) {
        const router = new Router();
        router.use(bodyParser(), onErr);
        for (const inf of infos) {
            const ware: Router.IMiddleware = async (ctx) => {
                let method: Function | undefined;
                if (inf.instance) {
                    method = _.get<Function>(inf.instance, inf.name);
                }
                if (!method) {
                    throw new Error(`Method ${inf.path} not implemented.`);
                }
                const args = this.pickBody(ctx.body);
                const data = await method.call(inf.instance, ...args);
                if (typeof data === "undefined") {
                    throw new Error(`Method ${inf.path} result is undefined.`);
                }
                ctx.body = { code: 200, data } as ResBody;
            };
            router.post(inf.path, ware);
        }

        return router;
    }

    createApp() {
        return new Koa();
    }

    pickBody(body: any) {
        const { args } = body;
        if (!Array.isArray(args)) {
            throw new Error(`body.args is not array`);
        }
        return args;
    }
}
