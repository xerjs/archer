import { z } from "zod";
export interface MethodInfo {
    res: unknown;
    pars: unknown[];
    name: string;
    path: string;
    instance: unknown;
    types: z.AnyZodTuple;
}

export type RpcOpt = {
    trans: string;
    path: string;
};

export type FunOpt = {
    path: string;
    types: z.AnyZodTuple;
};
