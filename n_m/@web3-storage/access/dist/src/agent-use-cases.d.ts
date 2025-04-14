/**
 * Request access by a session allowing this agent to issue UCANs
 * signed by the account.
 *
 * @param {AccessAgent} access
 * @param {API.Principal<API.AccountDID>} account
 * @param {Iterable<{ can: API.Ability }>} capabilities
 */
export function requestAccess(access: AccessAgent, account: API.Principal<API.AccountDID>, capabilities: Iterable<{
    can: API.Ability;
}>): Promise<void>;
/**
 * claim delegations delegated to an audience
 *
 * @param {AccessAgent} access
 * @param {API.DID} [audienceOfClaimedDelegations] - audience of claimed delegations. defaults to access.connection.id.did()
 * @param {object} opts
 * @param {string} [opts.nonce] - nonce to use for the claim
 * @param {boolean} [opts.addProofs] - whether to addProof to access agent
 */
export function claimAccess(access: AccessAgent, audienceOfClaimedDelegations?: `did:${string}:${string}` | undefined, { addProofs, nonce }?: {
    nonce?: string | undefined;
    addProofs?: boolean | undefined;
}): Promise<API.Delegation<API.Capabilities>[]>;
/**
 * @param {object} opts
 * @param {AccessAgent} opts.access
 * @param {API.SpaceDID} opts.space
 * @param {API.Principal<API.AccountDID>} opts.account
 * @param {API.ProviderDID} opts.provider - e.g. 'did:web:staging.web3.storage'
 */
export function addProvider({ access, space, account, provider }: {
    access: AccessAgent;
    space: API.SpaceDID;
    account: API.Principal<API.AccountDID>;
    provider: API.ProviderDID;
}): Promise<void>;
export function delegationsIncludeSessionProof(delegations: API.Delegation[]): boolean;
/**
 * @param {DelegationsChecker} delegationsMatch
 * @param {AccessAgent} access
 * @param {API.DID} delegee
 * @param {object} [opts]
 * @param {number} [opts.interval]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<Iterable<API.Delegation>>}
 */
export function pollAccessClaimUntil(delegationsMatch: DelegationsChecker, access: AccessAgent, delegee: API.DID, opts?: {
    interval?: number | undefined;
    signal?: AbortSignal | undefined;
} | undefined): Promise<Iterable<API.Delegation>>;
export function waitForAuthorizationByPolling(accessAgent: AccessAgent, opts: AuthorizationWaiterOpts<{
    interval?: number | undefined;
}>): Promise<Iterable<API.Delegation>>;
/**
 * Request authorization of a session allowing this agent to issue UCANs
 * signed by the passed email address.
 *
 * @param {AccessAgent} access
 * @param {`${string}@${string}`} email
 * @param {object} [opts]
 * @param {AbortSignal} [opts.signal]
 * @param {boolean} [opts.dontAddProofs] - whether to skip adding proofs to the agent
 * @param {Iterable<{ can: API.Ability }>} [opts.capabilities]
 * @param {AuthorizationWaiter} [opts.expectAuthorization] - function that will resolve once account has confirmed the authorization request
 */
export function authorizeAndWait(access: AccessAgent, email: `${string}@${string}`, opts?: {
    signal?: AbortSignal | undefined;
    dontAddProofs?: boolean | undefined;
    capabilities?: Iterable<{
        can: API.Ability;
    }> | undefined;
    expectAuthorization?: AuthorizationWaiter<{}> | undefined;
} | undefined): Promise<void>;
/**
 * Request authorization of a session allowing this agent to issue UCANs
 * signed by the passed email address.
 *
 * @param {AccessAgent} accessAgent
 * @param {`${string}@${string}`} email
 * @param {object} [opts]
 * @param {AbortSignal} [opts.signal]
 * @param {Iterable<{ can: API.Ability }>} [opts.capabilities]
 * @param {boolean} [opts.addProofs]
 * @param {AuthorizationWaiter} [opts.expectAuthorization] - function that will resolve once account has confirmed the authorization request
 */
export function authorizeWaitAndClaim(accessAgent: AccessAgent, email: `${string}@${string}`, opts?: {
    signal?: AbortSignal | undefined;
    capabilities?: Iterable<{
        can: API.Ability;
    }> | undefined;
    addProofs?: boolean | undefined;
    expectAuthorization?: AuthorizationWaiter<{}> | undefined;
} | undefined): Promise<void>;
/**
 * Provisions space with the specified account and sets up a recovery with the
 * same account.
 *
 * @param {AccessAgent} access
 * @param {AgentData} agentData
 * @param {string} email
 * @param {object} [opts]
 * @param {AbortSignal} [opts.signal]
 * @param {API.DID<'key'>} [opts.space]
 * @param {API.ProviderDID} [opts.provider] - provider to register - defaults to this.connection.id
 */
export function addProviderAndDelegateToAccount(access: AccessAgent, agentData: AgentData, email: string, opts?: {
    signal?: AbortSignal | undefined;
    space?: `did:key:${string}` | undefined;
    provider?: `did:web:${string}` | undefined;
} | undefined): Promise<void>;
/**
 *
 * @param {AccessAgent} agent
 * @param {API.AccountDID} account
 */
export function getAccountPlan(agent: AccessAgent, account: API.AccountDID): Promise<w3caps.Space.Store.Schema.Result<API.PlanGetSuccess, API.HandlerNotFound | API.HandlerExecutionError | API.InvalidAudience | API.Unauthorized | API.PlanGetFailure>>;
export type DelegationsChecker = (delegations: API.Delegation[]) => boolean;
export type AuthorizationWaiterOpts<T = {}> = {
    signal?: AbortSignal;
} & T;
export type AuthorizationWaiter<U = {}> = (accessAgent: AccessAgent, opts: AuthorizationWaiterOpts<U>) => Promise<Iterable<API.Delegation>>;
import { Agent as AccessAgent } from './agent.js';
import * as API from './types.js';
import { AgentData } from './agent-data.js';
import * as w3caps from '@web3-storage/capabilities';
//# sourceMappingURL=agent-use-cases.d.ts.map