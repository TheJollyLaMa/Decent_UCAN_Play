/**
 * The `piece/offer` task can be executed to request that a piece be aggregated
 * for inclusion in an upcoming an Filecoin deal. It issues a signed receipt
 * of the execution result. It is _also_ an effect linked from successful
 * execution of a `filecoin/submit` task.
 *
 * A receipt for successful execution will contain an effect, linking to a
 * `piece/accept` task that will complete asynchronously.
 *
 * Otherwise the task is failed and the receipt will contain details of the
 * reason behind the failure.
 *
 * @see https://github.com/storacha/specs/blob/main/w3-filecoin.md#pieceoffer
 *
 * @param {import('./types.js').InvocationConfig} conf - Configuration
 * @param {import('@web3-storage/data-segment').PieceLink} piece
 * @param {string} group
 * @param {import('./types.js').RequestOptions<AggregatorService>} [options]
 */
export function pieceOffer({ issuer, with: resource, proofs, audience }: import('./types.js').InvocationConfig, piece: import('@web3-storage/data-segment').PieceLink, group: string, options?: import("./types.js").RequestOptions<import("./types.js").AggregatorService> | undefined): Promise<import("@ucanto/interface").Receipt<import("@web3-storage/capabilities/types").PieceOfferSuccess, import("@ucanto/interface").Failure | import("@ucanto/interface").HandlerNotFound | import("@ucanto/interface").HandlerExecutionError | import("@ucanto/client").InvalidAudience | import("@ucanto/client").Unauthorized, import("@ucanto/interface").Invocation<import("@ucanto/client").Capability<import("@ucanto/client").Ability, `${string}:${string}`, unknown>>, import("@ucanto/client").SigAlg>>;
/**
 * The `piece/accept` task is an _effect_ linked from successful execution of a
 * `piece/offer` task, it is executed to issue a receipt for the success or
 * failure of the task.
 *
 * A receipt for successful execution indicates that the offered piece was
 * included in an aggregate. In this case the receipt will contain the
 * aggregate piece CID and a proof that the piece was included in the
 * aggregate. It also includes an effect, linking to an `aggregate/offer` task
 * that will complete asynchronously.
 *
 * Otherwise the task is failed and the receipt will contain details of the
 * reason behind the failure.
 *
 * @see https://github.com/storacha/specs/blob/main/w3-filecoin.md#pieceaccept
 *
 * @param {import('./types.js').InvocationConfig} conf - Configuration
 * @param {import('@web3-storage/data-segment').PieceLink} piece
 * @param {string} group
 * @param {import('./types.js').RequestOptions<AggregatorService>} [options]
 */
export function pieceAccept({ issuer, with: resource, proofs, audience }: import('./types.js').InvocationConfig, piece: import('@web3-storage/data-segment').PieceLink, group: string, options?: import("./types.js").RequestOptions<import("./types.js").AggregatorService> | undefined): Promise<import("@ucanto/interface").Receipt<import("@web3-storage/capabilities/types").PieceAcceptSuccess, import("@ucanto/interface").Failure | import("@ucanto/interface").HandlerNotFound | import("@ucanto/interface").HandlerExecutionError | import("@ucanto/client").InvalidAudience | import("@ucanto/client").Unauthorized, import("@ucanto/interface").Invocation<import("@ucanto/client").Capability<import("@ucanto/client").Ability, `${string}:${string}`, unknown>>, import("@ucanto/client").SigAlg>>;
/**
 * @typedef {import('./types.js').AggregatorService} AggregatorService
 * @typedef {import('@ucanto/interface').ConnectionView<AggregatorService>} ConnectionView
 */
/** @type {ConnectionView} */
export const connection: import("@ucanto/interface").ConnectionView<import("./types.js").AggregatorService>;
export type AggregatorService = import('./types.js').AggregatorService;
export type ConnectionView = import('@ucanto/interface').ConnectionView<AggregatorService>;
//# sourceMappingURL=aggregator.d.ts.map