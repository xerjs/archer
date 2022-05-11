import Koa from "koa";
import Router from "koa-router";
import { join as pathJoin } from "path";
import { Avalon, ClassType } from "@xerjs/avalon";

import { apiSvc, ActOpt } from "./api-svc";
import { Installer } from "./installer";

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
        const installer = new Installer();
        for (const ctr of this.allClass) {
            const ctrMeta = apiSvc.rule.getMetadata(ctr) as { perfix: string; };
            if (!ctrMeta) continue;
            const instance = this.resolve(ctr);

            for (const pkey of apiSvc.rule.getMetadata(ctr.prototype) as string[]) {
                const meta = Reflect.getMetadata(apiSvc.rule.metaKey(pkey), ctr.prototype, pkey) as ActOpt;
                installer.setRouter(meta.method.toLocaleLowerCase(), pathJoin(ctrMeta.perfix, meta.path), instance, pkey);
            }
        }

        installer.attachTo(this.app);
    }


}
