import Koa from "koa";
import Router from "koa-router";
import { join as pathJoin } from "path";
import { Avalon, ClassType } from "@xerjs/avalon";

import { svc, ActOpt, req, res } from "./decorator";
import { Installer } from "./installer";

export { svc, req, res };

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
            const ctrMeta = svc.rule.getMetadata(ctr) as { perfix: string; };
            if (!ctrMeta) continue;
            const instance = this.resolve(ctr);

            for (const pKey of svc.rule.getMetadata(ctr.prototype) as string[]) {
                const meta = svc.rule.propertyMeta(ctr.prototype, pKey) as ActOpt;
                const method = meta.method.toLocaleLowerCase();
                const pip = installer.pipRes(res.rule.arrMetadata(ctr.prototype, pKey));
                const act = installer.middleware(instance, pKey, req.rule.arrMetadata(ctr.prototype, pKey), pip);
                installer.setRouter(method, pathJoin(ctrMeta.perfix, meta.path), act);
            }
        }

        installer.attachTo(this.app);
    }
}
