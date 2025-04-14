/**
 * The `aggregate/offer` task can be executed to request an aggregate be added
 * to a deal with a Storage Provider. It issues a signed receipt of the
 * execution result. It is _also_ an effect linked from successful execution of
 * a `piece/accept` task.
 *
 * A receipt for successful execution will contain an effect, linking to an
 * `aggregate/accept` task that will complete asynchronously.
 *
 * Otherwise the task is failed and the receipt will contain details of the
 * reason behind the failure.
 *
 * @see https://github.com/storacha/specs/blob/main/w3-filecoin.md#aggregateoffer
 *
 * @param {import('./types.js').InvocationConfig} conf - Configuration
 * @param {import('@web3-storage/data-segment').PieceLink} aggregate
 * @param {import('@web3-storage/data-segment').PieceLink[]} pieces
 * @param {import('./types.js').RequestOptions<DealerService>} [options]
 */
export function aggregateOffer({ issuer, with: resource, proofs, audience }: import('./types.js').InvocationConfig, aggregate: import('@web3-storage/data-segment').PieceLink, pieces: import('@web3-storage/data-segment').PieceLink[], options?: import("./types.js").RequestOptions<import("./types.js").DealerService> | undefined): Promise<import("@ucanto/interface").Receipt<import("@web3-storage/capabilities/types").AggregateOfferSuccess, import("@ucanto/interface").Failure | import("@ucanto/interface").HandlerNotFound | import("@ucanto/interface").HandlerExecutionError | import("@ucanto/client").InvalidAudience | import("@ucanto/client").Unauthorized, import("@ucanto/interface").Invocation<import("@ucanto/client").Capability<import("@ucanto/client").Ability, `${string}:${string}`, unknown>>, import("@ucanto/client").SigAlg>>;
/**
 * The `aggregate/accept` task is an _effect_ linked from successful execution
 * of a `aggregate/offer` task, it is executed to issue a receipt for the
 * success or failure of the task.
 *
 * A receipt for successful execution indicates that an aggregate has been
 * accepted for inclusion in a Filecoin deal. In this case the receipt will
 * contain proofs that the piece was included in an aggregate and deal.
 *
 * Otherwise the task is failed and the receipt will contain details of the
 * reason behind the failure, as well as multiple effects, linking to
 * `piece/offer` tasks that will retry _valid_ pieces and complete
 * asynchronously.
 *
 * @see https://github.com/storacha/specs/blob/main/w3-filecoin.md#aggregateaccept
 *
 * @param {import('./types.js').InvocationConfig} conf - Configuration
 * @param {import('@web3-storage/data-segment').PieceLink} aggregate
 * @param {import('@ucanto/interface').Link} pieces
 * @param {import('./types.js').RequestOptions<DealerService>} [options]
 */
export function aggregateAccept({ issuer, with: resource, proofs, audience }: import('./types.js').InvocationConfig, aggregate: import('@web3-storage/data-segment').PieceLink, pieces: import('@ucanto/interface').Link, options?: import("./types.js").RequestOptions<import("./types.js").DealerService> | undefined): Promise<import("@ucanto/interface").Receipt<import("@web3-storage/capabilities/types").AggregateAcceptSuccess, import("@ucanto/interface").HandlerNotFound | import("@ucanto/interface").HandlerExecutionError | import("@ucanto/client").InvalidAudience | import("@ucanto/client").Unauthorized | import("@web3-storage/capabilities/types").AggregateAcceptFailure, import("@ucanto/interface").Invocation<import("@ucanto/client").Capability<import("@ucanto/client").Ability, `${string}:${string}`, unknown>>, import("@ucanto/client").SigAlg>>;
/**
 * @typedef {import('./types.js').DealerService} DealerService
 * @typedef {import('@ucanto/interface').ConnectionView<DealerService>} ConnectionView
 */
/** @type {ConnectionView} */
export const connection: import("@ucanto/interface").ConnectionView<import("./types.js").DealerService>;
export type DealerService = import('./types.js').DealerService;
export type ConnectionView = import('@ucanto/interface').ConnectionView<DealerService>;
//# sourceMappingURL=dealer.d.ts.map