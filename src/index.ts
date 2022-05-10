import Koa from "koa";
import Router from "koa-router";
import { Avalon, ClassType } from "@xerjs/avalon";

import { apiSvc } from "./api-svc";

export { apiSvc };

export class Archer extends Avalon {
    constructor(cors: ClassType[], port?: number) {
        super();
        this.initialize(cors);
        this.install();
    }

    install(): void {
        const app = new Koa();

        const router = new Router();
        for (const ctr of this.allClass) {
            const ctrMeta = apiSvc.rule.getMetadata(ctr) as { perfix: string; };
            if (!ctrMeta) continue;

            const propertyNames = apiSvc.rule.getMetadata(ctr.prototype) as string[];
            console.log(ctr.name, ctrMeta, propertyNames);

            for (const pkey of propertyNames) {
                const mkey = apiSvc.rule.metaKey(pkey);
                const meta = Reflect.getMetadata(mkey, ctr.prototype, pkey) as apiSvc.ActOpt;
                console.log(pkey, mkey, meta);

                this.resolve(ctr)[pkey]().then((e: any) => console.log(e));
                router.get(ctrMeta.perfix + meta.path, async (ctx, next) => {
                    // ctx.router available
                    ctx.body = await this.resolve(ctr)[pkey]();
                    console.log(ctx.body);
                });
            }

            app
                .use(router.routes())
                .use(router.allowedMethods());
        }
    }
}
