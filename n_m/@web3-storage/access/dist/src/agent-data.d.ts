/**
 * @typedef {string} SessionProofAuthorizationCid - the nb.proof CID of the ucan/attest in the session proof
 * @typedef {Ucanto.DID} SessionProofIssuer - issuer of ucan/attest session proof
 * @typedef {Record<SessionProofAuthorizationCid, Record<SessionProofIssuer, [Ucanto.Delegation, ...Ucanto.Delegation[]]>>} SessionProofIndexedByAuthorizationAndIssuer
 */
/**
 * Get a map from CIDs to the session proofs that reference them
 *
 * @param {AgentData} data
 * @returns {SessionProofIndexedByAuthorizationAndIssuer}
 */
export function getSessionProofs(data: AgentData): SessionProofIndexedByAuthorizationAndIssuer;
/** @typedef {import('./types.js').AgentDataModel} AgentDataModel */
/** @implements {AgentDataModel} */
export class AgentData implements AgentDataModel {
    /**
     * Create a new AgentData instance from the passed initialization data.
     *
     * @param {Partial<import('./types.js').AgentDataModel>} [init]
     * @param {import('./types.js').AgentDataOptions} [options]
     */
    static create(init?: Partial<import("./types.js").AgentDataModel> | undefined, options?: import("./types.js").AgentDataOptions | undefined): Promise<AgentData>;
    /**
     * Instantiate AgentData from previously exported data.
     *
     * @param {import('./types.js').AgentDataExport} raw
     * @param {import('./types.js').AgentDataOptions} [options]
     */
    static fromExport(raw: import('./types.js').AgentDataExport, options?: import("./types.js").AgentDataOptions | undefined): AgentData;
    /**
     * @param {import('./types.js').AgentDataModel} data
     * @param {import('./types.js').AgentDataOptions} [options]
     */
    constructor(data: import('./types.js').AgentDataModel, options?: import("./types.js").AgentDataOptions | undefined);
    meta: import("./types.js").AgentMeta;
    principal: EdSigner.Signer<`did:key:${string}`, EdSigner.Crypto.SigAlg>;
    spaces: Map<`did:${string}:${string}`, import("./types.js").SpaceMeta>;
    delegations: Map<string, {
        meta: import("./types.js").DelegationMeta;
        delegation: EdSigner.Delegation<EdSigner.Capabilities>;
    }>;
    currentSpace: `did:key:${string}` | undefined;
    /**
     * Export data in a format safe to pass to `structuredClone()`.
     */
    export(): import("./types.js").AgentDataExport;
    /**
     * @param {import('@ucanto/interface').DID} did
     * @param {import('./types.js').SpaceMeta} meta
     * @param {import('@ucanto/interface').Delegation} [proof]
     */
    addSpace(did: import('@ucanto/interface').DID, meta: import('./types.js').SpaceMeta, proof?: EdSigner.Delegation<EdSigner.Capabilities> | undefined): Promise<void>;
    /**
     * @deprecated
     * @param {import('@ucanto/interface').DID<'key'>} did
     */
    setCurrentSpace(did: import('@ucanto/interface').DID<'key'>): Promise<void>;
    /**
     * @param {import('@ucanto/interface').Delegation} delegation
     * @param {import('./types.js').DelegationMeta} [meta]
     */
    addDelegation(delegation: import('@ucanto/interface').Delegation, meta?: import("./types.js").DelegationMeta | undefined): Promise<void>;
    /**
     * @param {import('@ucanto/interface').UCANLink} cid
     */
    removeDelegation(cid: import('@ucanto/interface').UCANLink): Promise<void>;
    #private;
}
export function isSessionProof(delegation: Ucanto.Delegation): delegation is EdSigner.Delegation<[{
    can: "ucan/attest";
    with: `did:${string}:${string}` & `did:${string}` & EdSigner.Phantom<{
        protocol: "did:";
    }> & `${string}:${string}`;
    nb: Pick<{
        proof: EdSigner.Link<unknown, number, number, 1>;
    }, "proof"> & Partial<Pick<{
        proof: EdSigner.Link<unknown, number, number, 1>;
    }, never>>;
}]>;
/**
 * - the nb.proof CID of the ucan/attest in the session proof
 */
export type SessionProofAuthorizationCid = string;
/**
 * - issuer of ucan/attest session proof
 */
export type SessionProofIssuer = Ucanto.DID;
export type SessionProofIndexedByAuthorizationAndIssuer = Record<SessionProofAuthorizationCid, Record<SessionProofIssuer, [Ucanto.Delegation, ...Ucanto.Delegation[]]>>;
export type AgentDataModel = import('./types.js').AgentDataModel;
import { Signer as EdSigner } from '@ucanto/principal/ed25519';
import * as Ucanto from '@ucanto/interface';
//# sourceMappingURL=agent-data.d.ts.map