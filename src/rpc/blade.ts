import { AvalonContainer, ClassType, Provider } from "@xerjs/avalon";

import { RequestListener, createServer, Server } from "http";
import { rpcMeta } from "./decorator";
import { MethodInfo, FunOpt, RpcOpt } from "./types";
import { KoaAdapter } from "./ada/koa-app";

@Provider()
export class Blade {
    constructor(protected ada: KoaAdapter) {}

    info(cls: ClassType): MethodInfo[] {
        const clsMeta = rpcMeta.classValue(cls) as RpcOpt;
        const root = clsMeta.path || cls.name;
        const instance = AvalonContainer.root.resolve(cls);
        const infos: MethodInfo[] = rpcMeta.propertyKeys(cls).map((mk) => {
            const res = rpcMeta.returnType(cls, mk);
            const pars = rpcMeta.paramTypes(cls, mk);
            const mMate = rpcMeta.propertyValue(cls, mk) as FunOpt;
            let path = mMate.path || mk;
            if (path === ".") {
                path = mk;
            }
            return { name: mk, res, pars, path: `/${root}/${path}`, instance, types: mMate.types };
        });

        return infos;
    }

    install(cls: ClassType[], prefix?: string): RequestListener {
        const app = this.ada.createApp();
        for (const ctr of cls) {
            const r = this.ada.createRouter(this.info(ctr));
            if (prefix) {
                r.prefix(prefix);
            }
            app.use(r.routes());
        }
        return app.callback();
    }

    createServer(cls: ClassType[]): Server {
        return createServer(this.install(cls));
    }
}
