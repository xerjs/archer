import { ClassType } from "@xerjs/avalon";

import { RequestListener, createServer, IncomingMessage, ServerResponse, Server } from "http";
import { FunOpt, RpcOpt, rpcMeta } from "./decorator";
import { MethodInfo } from "./types";

export class Blade {
    info(cls: ClassType): MethodInfo[] {
        const clsMeta = rpcMeta.classValue(cls) as RpcOpt;
        const root = clsMeta.path || cls.name;

        const infos: MethodInfo[] = rpcMeta.propertyKeys(cls).map((mk) => {
            const res = rpcMeta.returnType(cls, mk);
            const pars = rpcMeta.paramTypes(cls, mk);
            const mMate = rpcMeta.propertyValue(cls, mk) as FunOpt;
            let path = mMate.path || mk;
            if (path === ".") {
                path = mk;
            }
            return { name: mk, res, pars, path: `/${root}/${path}` };
        });

        return infos;
    }

    install(cls: ClassType[]): RequestListener {
        return (req: IncomingMessage, res: ServerResponse) => {
            res.statusCode = 200;
            setTimeout(() => {
                res.setHeader("Content-Type", "text/plain");
                res.end("Hello World\n");
            }, 1000);
        };
    }

    createServer(cls: ClassType[]): Server {
        return createServer(this.install(cls));
    }
}
