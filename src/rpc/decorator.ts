import { Provider, MetaUtil } from "@xerjs/avalon";
import { z } from "zod";

export const rpcMeta = new MetaUtil("archer.rpc");

export type RpcOpt = {
    trans?: string;
    path?: string;
};
export const rpc = rpcMeta.classDecorator<RpcOpt>((x) => {
    x = x || {};
    x.trans = x.trans || "axios";
    Object.freeze(x);
    return x;
});

export type FunOpt = {
    path: string;
    types: z.AnyZodTuple;
};
export const rpcFun = rpcMeta.propertyDecorator<Partial<FunOpt>>((x) => {
    x = x || {};
    Object.freeze(x);
    return x;
});
