import { Provider, MetaUtil } from "@xerjs/avalon";

export const rpcMeta = new MetaUtil("archer.rpc");

export type RpcOpt = {
    trans: string;
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
};
export const rpcFun = rpcMeta.propertyDecorator<FunOpt>((x) => {
    x = x || {};
    Object.freeze(x);
    return x;
});
