/**
 * Top-level capability for Filecoin operations.
 */
export const filecoin: import("@ucanto/interface").TheCapabilityParser<import("@ucanto/interface").CapabilityMatch<"filecoin/*", `did:${string}:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, any>>;
/**
 * Capability allowing an agent to _request_ storing a content piece in
 * Filecoin.
 */
export const filecoinOffer: import("@ucanto/interface").TheCapabilityParser<import("@ucanto/interface").CapabilityMatch<"filecoin/offer", `did:${string}:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    content: Schema.Schema<import("@ucanto/interface").Link<unknown, number, number, 0 | 1>, any>;
    piece: import("../types.js").PieceLinkSchema;
}>>>;
/**
 * Capability allowing a Storefront to signal that an offered piece has been
 * submitted to the filecoin storage pipeline.
 */
export const filecoinSubmit: import("@ucanto/interface").TheCapabilityParser<import("@ucanto/interface").CapabilityMatch<"filecoin/submit", `did:${string}:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    content: Schema.Schema<import("@ucanto/interface").Link<unknown, number, number, 0 | 1>, any>;
    piece: import("../types.js").PieceLinkSchema;
}>>>;
/**
 * Capability allowing a Storefront to signal that a submitted piece has been
 * accepted in a Filecoin deal. The receipt contains the proof.
 */
export const filecoinAccept: import("@ucanto/interface").TheCapabilityParser<import("@ucanto/interface").CapabilityMatch<"filecoin/accept", `did:${string}:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    content: Schema.Schema<import("@ucanto/interface").Link<unknown, number, number, 0 | 1>, any>;
    piece: import("../types.js").PieceLinkSchema;
}>>>;
/**
 * Capability allowing an agent to _request_ info about a content piece in
 * Filecoin deals.
 */
export const filecoinInfo: import("@ucanto/interface").TheCapabilityParser<import("@ucanto/interface").CapabilityMatch<"filecoin/info", `did:${string}:${string}` & `did:${string}` & import("@ucanto/interface").Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    piece: import("../types.js").PieceLinkSchema;
}>>>;
import { Schema } from '@ucanto/validator';
//# sourceMappingURL=storefront.d.ts.map