export function delegate(agent: Agent, { delegations, proofs, space }: {
    delegations: API.Delegation[];
    space?: `did:key:${string}` | undefined;
    proofs?: API.Delegation<API.Capabilities>[] | undefined;
}): Promise<{
    error: API.Failure;
    ok?: undefined;
} | API.Result<API.Unit, API.HandlerNotFound | API.HandlerExecutionError | API.InvalidAudience | API.Unauthorized | API.AccessDelegateFailure>>;
export function request(agent: API.Agent, { account, provider, audience: audience, access, }: {
    account: API.AccountDID;
    provider?: `did:web:${string}` | undefined;
    audience?: `did:${string}:${string}` | undefined;
    access?: API.Access | undefined;
}): Promise<API.Result<PendingAccessRequest, API.AccessAuthorizeFailure | API.InvocationError>>;
export function claim(agent: API.Agent, { provider, audience, }?: {
    audience?: `did:${string}:${string}` | undefined;
    provider?: `did:web:${string}` | undefined;
}): Promise<API.Result<GrantedAccess, API.AccessClaimFailure | API.InvocationError>>;
export function createPendingAccessRequest(agent: API.Agent, { request, expiration, provider, audience: audience, }: {
    request: API.Link;
    expiration: API.UTCUnixTimestamp;
    audience?: `did:${string}:${string}` | undefined;
    provider?: `did:web:${string}` | undefined;
}): PendingAccessRequest;
/**
 * View over the UCAN Delegations that grant access to a specific principal.
 */
export class GrantedAccess {
    /**
     * @typedef {object} GrantedAccessModel
     * @property {API.Agent} agent - Agent that processed the request.
     * @property {API.Tuple<API.Delegation>} proofs - Delegations that grant access.
     *
     * @param {GrantedAccessModel} model
     */
    constructor(model: {
        /**
         * - Agent that processed the request.
         */
        agent: API.Agent;
        /**
         * - Delegations that grant access.
         */
        proofs: API.Transport.Tuple<API.Delegation<API.Capabilities>>;
    });
    model: {
        /**
         * - Agent that processed the request.
         */
        agent: API.Agent;
        /**
         * - Delegations that grant access.
         */
        proofs: API.Transport.Tuple<API.Delegation<API.Capabilities>>;
    };
    get proofs(): API.Transport.Tuple<API.Delegation<API.Capabilities>>;
    /**
     * Saves access into the agents proofs store so that it can be retained
     * between sessions.
     *
     * @param {object} input
     * @param {API.Agent} [input.agent]
     */
    save({ agent }?: {
        agent?: API.Agent<API.Service> | undefined;
    }): Promise<API.Result<API.Unit, Error>>;
}
export function toCapabilities(access: API.Access): {
    can: API.Ability;
}[];
/**
 * Set of capabilities required by the agent to manage a space.
 */
export const spaceAccess: {
    'space/*': {};
    'blob/*': {};
    'index/*': {};
    'store/*': {};
    'upload/*': {};
    'access/*': {};
    'filecoin/*': {};
    'usage/*': {};
};
/**
 * Set of capabilities required for by the agent to manage an account.
 */
export const accountAccess: {
    '*': {};
};
import { Agent } from './agent.js';
import * as API from './types.js';
/**
 * Represents a pending access request. It can be used to poll for the requested
 * delegation.
 */
declare class PendingAccessRequest {
    /**
     * @typedef {object} PendingAccessRequestModel
     * @property {API.Agent} agent - Agent handling interaction.
     * @property {API.DID} audience - Principal requesting an access.
     * @property {API.ProviderDID} provider - Provider handling request.
     * @property {API.UTCUnixTimestamp} expiration - Seconds in UTC.
     * @property {API.Link} request - Link to the `access/authorize` invocation.
     *
     * @param {PendingAccessRequestModel} model
     */
    constructor(model: {
        /**
         * - Agent handling interaction.
         */
        agent: API.Agent;
        /**
         * - Principal requesting an access.
         */
        audience: API.DID;
        /**
         * - Provider handling request.
         */
        provider: API.ProviderDID;
        /**
         * - Seconds in UTC.
         */
        expiration: API.UTCUnixTimestamp;
        /**
         * - Link to the `access/authorize` invocation.
         */
        request: API.Link;
    });
    model: {
        /**
         * - Agent handling interaction.
         */
        agent: API.Agent;
        /**
         * - Principal requesting an access.
         */
        audience: API.DID;
        /**
         * - Provider handling request.
         */
        provider: API.ProviderDID;
        /**
         * - Seconds in UTC.
         */
        expiration: API.UTCUnixTimestamp;
        /**
         * - Link to the `access/authorize` invocation.
         */
        request: API.Link;
    };
    get agent(): API.Agent<API.Service>;
    get audience(): `did:${string}:${string}`;
    get expiration(): Date;
    get request(): API.Link<any, number, number, 1>;
    get provider(): `did:web:${string}`;
    /**
     * Low level method and most likely you want to use `.claim` instead. This method will poll
     * fetch delegations **just once** and will return proofs matching to this request. Please note
     * that there may not be any matches in which case result will be `{ ok: [] }`.
     *
     * If you do want to continuously poll until request is approved or expired, you should use
     * `.claim` method instead.
     *
     * @returns {Promise<API.Result<API.Delegation[], API.InvocationError|API.AccessClaimFailure|RequestExpired>>}
     */
    poll(): Promise<API.Result<API.Delegation[], API.InvocationError | API.AccessClaimFailure | RequestExpired>>;
    /**
     * Continuously polls delegations until this request is approved or expired. Returns
     * a `GrantedAccess` object (view over the delegations) that can be used in the
     * invocations or can be saved in the agent (store) using `.save()` method.
     *
     * @param {object} options
     * @param {number} [options.interval]
     * @param {AbortSignal} [options.signal]
     * @returns {Promise<API.Result<GrantedAccess, Error>>}
     */
    claim({ signal, interval }?: {
        interval?: number | undefined;
        signal?: AbortSignal | undefined;
    }): Promise<API.Result<GrantedAccess, Error>>;
}
import * as Access from '@web3-storage/capabilities/access';
/**
 * Error returned when pending access request expires.
 */
declare class RequestExpired extends Failure {
    /**
     * @param {PendingAccessRequestModel} model
     */
    constructor(model: {
        /**
         * - Agent handling interaction.
         */
        agent: API.Agent<API.Service>;
        /**
         * - Principal requesting an access.
         */
        audience: `did:${string}:${string}`;
        /**
         * - Provider handling request.
         */
        provider: `did:web:${string}`;
        /**
         * - Seconds in UTC.
         */
        expiration: number;
        /**
         * - Link to the `access/authorize` invocation.
         */
        request: API.Link<any, number, number, 1>;
    });
    model: {
        /**
         * - Agent handling interaction.
         */
        agent: API.Agent<API.Service>;
        /**
         * - Principal requesting an access.
         */
        audience: `did:${string}:${string}`;
        /**
         * - Provider handling request.
         */
        provider: `did:web:${string}`;
        /**
         * - Seconds in UTC.
         */
        expiration: number;
        /**
         * - Link to the `access/authorize` invocation.
         */
        request: API.Link<any, number, number, 1>;
    };
    get name(): string;
    get request(): API.Link<any, number, number, 1>;
    get expiredAt(): Date;
}
import { Failure } from '@ucanto/core';
export {};
//# sourceMappingURL=access.d.ts.map