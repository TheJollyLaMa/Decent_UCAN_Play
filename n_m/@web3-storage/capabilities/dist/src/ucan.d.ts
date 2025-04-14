export const UCANLink: Schema.Schema<API.UCANLink<API.Capabilities, API.MulticodecCode<number, string>, API.SigAlg>, unknown>;
/**
 * Capability can only be delegated (but not invoked) allowing audience to
 * derived any `store/` prefixed capability for the (memory) space identified
 * by DID in the `with` field.
 */
export const ucan: API.TheCapabilityParser<API.CapabilityMatch<"ucan/*", `did:${string}:${string}` & `did:${string}` & API.Phantom<{
    protocol: "did:";
}>, any>>;
/**
 * `ucan/revoke` capability is a replacement for the
 * [UCAN Revocation](https://github.com/ucan-wg/spec#66-revocation) that had
 * been proposed to a UCAN working group and had a tentative support from
 * members.
 *
 * Capability can be used to revoke `nb.ucan` authorization from all proofs
 * chains that lead to the UCAN issued or being delegated to the principal
 * identified by the `with` field. Note that revoked UCAN MUST continue to
 * be valid in the invocation where proof chain does not lead to the principal
 * identified by the `with` field.
 */
export const revoke: API.TheCapabilityParser<API.CapabilityMatch<"ucan/revoke", `did:${string}:${string}` & `did:${string}` & API.Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    ucan: Schema.Schema<API.UCANLink<API.Capabilities, API.MulticodecCode<number, string>, API.SigAlg>, unknown>;
    proof: Schema.Schema<API.UCANLink<API.Capabilities, API.MulticodecCode<number, string>, API.SigAlg>[] | undefined, unknown>;
}>>>;
/**
 * `ucan/conclude` capability represents a receipt using a special UCAN capability.
 *
 * The UCAN invocation specification defines receipt record, that is cryptographically
 * signed description of the invocation output and requested effects. Receipt
 * structure is very similar to UCAN except it has no notion of expiry nor it is
 * possible to delegate ability to issue receipt to another principal.
 */
export const conclude: API.TheCapabilityParser<API.CapabilityMatch<"ucan/conclude", `did:${string}:${string}` & `did:${string}` & API.Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    receipt: Schema.Schema<API.Link<unknown, number, number, 0 | 1>, any>;
}>>>;
/**
 * Issued by trusted authority (usually the one handling invocation) that attest
 * that specific UCAN delegation has been considered authentic.
 *
 * @see https://github.com/storacha/specs/blob/main/w3-session.md#authorization-session
 *
 * @example
 * ```js
 * {
    iss: "did:web:web3.storage",
    aud: "did:key:z6Mkk89bC3JrVqKie71YEcc5M1SMVxuCgNx6zLZ8SYJsxALi",
    att: [{
      "with": "did:web:web3.storage",
      "can": "ucan/attest",
      "nb": {
        "proof": {
          "/": "bafyreifer23oxeyamllbmrfkkyvcqpujevuediffrpvrxmgn736f4fffui"
        }
      }
    }],
    exp: null
    sig: "..."
  }
 * ```
 */
export const attest: API.TheCapabilityParser<API.CapabilityMatch<"ucan/attest", `did:${string}:${string}` & `did:${string}` & API.Phantom<{
    protocol: "did:";
}>, Schema.InferStruct<{
    proof: Schema.Schema<API.Link<unknown, number, number, 1>, any>;
}>>>;
import * as API from '@ucanto/interface';
import { Schema } from '@ucanto/validator';
//# sourceMappingURL=ucan.d.ts.map