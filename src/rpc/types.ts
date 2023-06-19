import { z } from "zod";
export interface MethodInfo {
    res: unknown;
    pars: unknown[];
    name: string;
    path: string;
    instance: unknown;
    types: z.AnyZodTuple;
}
