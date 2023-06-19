import { MetaUtil } from "@xerjs/avalon";
import { FunOpt, RpcOpt } from "./types";

export const rpcMeta = new MetaUtil("archer.rpc");

export const rpc = rpcMeta.classDecorator<Partial<RpcOpt>>((x) => {
    x = x || {};
    x.trans = x.trans || "axios";
    Object.freeze(x);
    return x;
});

export const rpcFun = rpcMeta.propertyDecorator<Partial<FunOpt>>((x) => {
    x = x || {};
    Object.freeze(x);
    return x;
});
