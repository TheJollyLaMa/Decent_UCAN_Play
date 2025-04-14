export const code: 514;
export const CARLink: Schema.Schema<import("@ucanto/interface").Link<unknown, 514, number, 1>, any>;
/**
 * Capability can only be delegated (but not invoked) allowing audience to
 * derived any `store/` prefixed capability for the (memory) space identified
 * by DID in the `with` field.
 */
export const store: import("@ucanto/interface").TheCapabilityParser<import("@ucanto/interface").CapabilityMatch<"store/*", `did:key:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, any>>;
/**
 * `store/add` capability allows agent to store a CAR file into a (memory) space
 * identified by did:key in the `with` field. Agent must precompute CAR locally
 * and provide it's CID and size using `nb.link` and `nb.size` fields, allowing
 * a service to provision a write location for the agent to PUT or POST desired
 * CAR into.
 */
export const add: import("@ucanto/interface").TheCapabilityParser<import("@ucanto/interface").CapabilityMatch<"store/add", `did:key:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    link: Schema.Schema<import("@ucanto/interface").Link<unknown, 514, number, 1>, any>;
    size: Schema.NumberSchema<number & import("@ucanto/interface").Phantom<{
        typeof: "integer";
    }>, unknown>;
    origin: Schema.Schema<import("@ucanto/interface").Link<unknown, number, number, 0 | 1> | undefined, unknown>;
}>>>;
/**
 * Capability to get store metadata by shard CID.
 * Use to check for inclusion, or get shard size and origin
 *
 * `nb.link` is optional to allow delegation of `store/get`
 * capability for any shard CID. If link is specified, then the
 * capability only allows a get for that specific CID.
 *
 * When used as as an invocation, `nb.link` must be specified.
 */
export const get: import("@ucanto/interface").TheCapabilityParser<import("@ucanto/interface").CapabilityMatch<"store/get", `did:key:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    link: Schema.Schema<import("@ucanto/interface").Link<unknown, 514, number, 1> | undefined, any>;
}>>>;
/**
 * Capability can be used to remove the stored CAR file from the (memory)
 * space identified by `with` field.
 */
export const remove: import("@ucanto/interface").TheCapabilityParser<import("@ucanto/interface").CapabilityMatch<"store/remove", `did:key:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    link: Schema.Schema<import("@ucanto/interface").Link<unknown, 514, number, 1>, any>;
}>>>;
/**
 * Capability can be invoked to request a list of stored CAR files in the
 * (memory) space identified by `with` field.
 */
export const list: import("@ucanto/interface").TheCapabilityParser<import("@ucanto/interface").CapabilityMatch<"store/list", `did:key:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    cursor: Schema.Schema<string | undefined, unknown>;
    size: Schema.Schema<(number & import("@ucanto/interface").Phantom<{
        typeof: "integer";
    }>) | undefined, unknown>;
    pre: Schema.Schema<boolean | undefined, unknown>;
}>>>;
export const all: import("@ucanto/interface").CapabilityParser<import("@ucanto/interface").CapabilityMatch<"store/add", `did:key:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    link: Schema.Schema<import("@ucanto/interface").Link<unknown, 514, number, 1>, any>;
    size: Schema.NumberSchema<number & import("@ucanto/interface").Phantom<{
        typeof: "integer";
    }>, unknown>;
    origin: Schema.Schema<import("@ucanto/interface").Link<unknown, number, number, 0 | 1> | undefined, unknown>;
}>> | import("@ucanto/interface").CapabilityMatch<"store/remove", `did:key:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    link: Schema.Schema<import("@ucanto/interface").Link<unknown, 514, number, 1>, any>;
}>> | import("@ucanto/interface").CapabilityMatch<"store/list", `did:key:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    cursor: Schema.Schema<string | undefined, unknown>;
    size: Schema.Schema<(number & import("@ucanto/interface").Phantom<{
        typeof: "integer";
    }>) | undefined, unknown>;
    pre: Schema.Schema<boolean | undefined, unknown>;
}>>>;
import { Schema } from '@ucanto/validator';
import { Link } from '@ucanto/validator';
export { Schema, Link };
//# sourceMappingURL=store.d.ts.map