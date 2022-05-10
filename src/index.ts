import Koa from "koa";
import Router from "koa-router";
import { join as pathJoin } from "path";
import { Avalon, ClassType } from "@xerjs/avalon";

import { apiSvc } from "./api-svc";

export { apiSvc };

export class Archer extends Avalon {
    constructor(cors: ClassType[], port?: number) {
        super();
        this.app = new Koa();
        this.initialize(cors);
        this.install();
    }

    readonly app: Koa;

    install(): void {
        const router = new Router();
        for (const ctr of this.allClass) {
            const ctrMeta = apiSvc.rule.getMetadata(ctr) as { perfix: string; };
            if (!ctrMeta) continue;

            const propertyNames = apiSvc.rule.getMetadata(ctr.prototype) as string[];

            for (const pkey of propertyNames) {
                const mkey = apiSvc.rule.metaKey(pkey);
                const meta = Reflect.getMetadata(mkey, ctr.prototype, pkey) as apiSvc.ActOpt;

                const instance = this.resolve(ctr);
                router.get(pathJoin(ctrMeta.perfix, meta.path), async (ctx, next) => {
                    // ctx.router available
                    const res = await instance[pkey]();
                    ctx.body = res;
                });
            }
            this.app
                .use(router.routes())
                .use(router.allowedMethods());

        }
    }
}
