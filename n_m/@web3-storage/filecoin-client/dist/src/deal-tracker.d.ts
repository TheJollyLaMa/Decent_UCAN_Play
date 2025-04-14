/**
 * The `deal/info` task can be executed to request deal information for a given
 * piece. It issues a signed receipt of the execution result.
 *
 * A receipt for successful execution will contain details of deals the
 * provided piece CID is currently active in.
 *
 * Otherwise the task is failed and the receipt will contain details of the
 * reason behind the failure.
 *
 * @see https://github.com/storacha/specs/blob/main/w3-filecoin.md#dealinfo
 *
 * @param {import('./types.js').InvocationConfig} conf - Configuration
 * @param {import('@web3-storage/data-segment').PieceLink} piece
 * @param {import('./types.js').RequestOptions<DealTrackerService>} [options]
 */
export function dealInfo({ issuer, with: resource, proofs, audience }: import('./types.js').InvocationConfig, piece: import('@web3-storage/data-segment').PieceLink, options?: import("./types.js").RequestOptions<import("./types.js").DealTrackerService> | undefined): Promise<import("@ucanto/interface").Receipt<import("@web3-storage/capabilities/types").DealInfoSuccess, import("@ucanto/interface").HandlerNotFound | import("@ucanto/interface").HandlerExecutionError | import("@ucanto/client").InvalidAudience | import("@ucanto/client").Unauthorized | import("@web3-storage/capabilities/types").DealInfoFailure, import("@ucanto/interface").Invocation<import("@ucanto/client").Capability<import("@ucanto/client").Ability, `${string}:${string}`, unknown>>, import("@ucanto/client").SigAlg>>;
/**
 * @typedef {import('./types.js').DealTrackerService} DealTrackerService
 * @typedef {import('@ucanto/interface').ConnectionView<DealTrackerService>} ConnectionView
 */
/** @type {ConnectionView} */
export const connection: import("@ucanto/interface").ConnectionView<import("./types.js").DealTrackerService>;
export type DealTrackerService = import('./types.js').DealTrackerService;
export type ConnectionView = import('@ucanto/interface').ConnectionView<DealTrackerService>;
//# sourceMappingURL=deal-tracker.d.ts.map