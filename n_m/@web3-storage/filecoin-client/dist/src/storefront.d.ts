/**
 * The `filecoin/offer` task can be executed to request storing a content piece
 * in Filecoin. It issues a signed receipt of the execution result.
 *
 * A receipt for successful execution will contain an effect, linking to a
 * `filecoin/submit` task that will complete asynchronously.
 *
 * Otherwise the task is failed and the receipt will contain details of the
 * reason behind the failure.
 *
 * @see https://github.com/storacha/specs/blob/main/w3-filecoin.md#filecoinoffer
 *
 * @param {import('./types.js').InvocationConfig} conf - Configuration
 * @param {import('multiformats').UnknownLink} content
 * @param {import('@web3-storage/data-segment').PieceLink} piece
 * @param {import('./types.js').RequestOptions<StorefrontService>} [options]
 */
export function filecoinOffer({ issuer, with: resource, proofs, audience }: import('./types.js').InvocationConfig, content: import('multiformats').UnknownLink, piece: import('@web3-storage/data-segment').PieceLink, options?: import("./types.js").RequestOptions<import("./types.js").StorefrontService> | undefined): Promise<import("@ucanto/interface").Receipt<import("@web3-storage/capabilities/types").FilecoinOfferSuccess, import("@ucanto/interface").HandlerNotFound | import("@ucanto/interface").HandlerExecutionError | import("@ucanto/client").InvalidAudience | import("@ucanto/client").Unauthorized | import("@web3-storage/capabilities/types").FilecoinOfferFailure, import("@ucanto/interface").Invocation<import("@ucanto/client").Capability<import("@ucanto/client").Ability, `${string}:${string}`, unknown>>, import("@ucanto/client").SigAlg>>;
/**
 * The `filecoin/submit` task is an _effect_ linked from successful execution
 * of a `filecoin/offer` task, it is executed to issue a receipt for the
 * success or failure of the task.
 *
 * A receipt for successful execution indicates that the offered piece has been
 * submitted to the pipeline. In this case the receipt will contain an effect,
 * linking to a `piece/offer` task that will complete asynchronously.
 *
 * Otherwise the task is failed and the receipt will contain details of the
 * reason behind the failure.
 *
 * @see https://github.com/storacha/specs/blob/main/w3-filecoin.md#filecoinsubmit
 *
 * @param {import('./types.js').InvocationConfig} conf - Configuration
 * @param {import('multiformats').UnknownLink} content
 * @param {import('@web3-storage/data-segment').PieceLink} piece
 * @param {import('./types.js').RequestOptions<StorefrontService>} [options]
 */
export function filecoinSubmit({ issuer, with: resource, proofs, audience }: import('./types.js').InvocationConfig, content: import('multiformats').UnknownLink, piece: import('@web3-storage/data-segment').PieceLink, options?: import("./types.js").RequestOptions<import("./types.js").StorefrontService> | undefined): Promise<import("@ucanto/interface").Receipt<import("@web3-storage/capabilities/types").FilecoinSubmitSuccess, import("@ucanto/interface").HandlerNotFound | import("@ucanto/interface").HandlerExecutionError | import("@ucanto/client").InvalidAudience | import("@ucanto/client").Unauthorized | import("@web3-storage/capabilities/types").FilecoinSubmitFailure, import("@ucanto/interface").Invocation<import("@ucanto/client").Capability<import("@ucanto/client").Ability, `${string}:${string}`, unknown>>, import("@ucanto/client").SigAlg>>;
/**
 * The `filecoin/accept` task is an _effect_ linked from successful execution
 * of a `filecoin/offer` task, it is executed to issue a receipt for the
 * success or failure of the task.
 *
 * A receipt for successful execution indicates that the offered piece has been
 * accepted in a Filecoin deal. In this case the receipt will contain proofs
 * that the piece was included in an aggregate and deal.
 *
 * Otherwise the task is failed and the receipt will contain details of the
 * reason behind the failure.
 *
 * @see https://github.com/storacha/specs/blob/main/w3-filecoin.md#filecoinaccept
 *
 * @param {import('./types.js').InvocationConfig} conf - Configuration
 * @param {import('multiformats').UnknownLink} content
 * @param {import('@web3-storage/data-segment').PieceLink} piece
 * @param {import('./types.js').RequestOptions<StorefrontService>} [options]
 */
export function filecoinAccept({ issuer, with: resource, proofs, audience }: import('./types.js').InvocationConfig, content: import('multiformats').UnknownLink, piece: import('@web3-storage/data-segment').PieceLink, options?: import("./types.js").RequestOptions<import("./types.js").StorefrontService> | undefined): Promise<import("@ucanto/interface").Receipt<import("@web3-storage/capabilities/types").FilecoinAcceptSuccess, import("@ucanto/interface").HandlerNotFound | import("@ucanto/interface").HandlerExecutionError | import("@ucanto/client").InvalidAudience | import("@ucanto/client").Unauthorized | import("@web3-storage/capabilities/types").FilecoinAcceptFailure, import("@ucanto/interface").Invocation<import("@ucanto/client").Capability<import("@ucanto/client").Ability, `${string}:${string}`, unknown>>, import("@ucanto/client").SigAlg>>;
/**
 * The `filecoin/info` task can be executed to request info about a content piece
 * in Filecoin. It issues a signed receipt of the execution result.
 *
 * @param {import('./types.js').InvocationConfig} conf - Configuration
 * @param {import('@web3-storage/data-segment').PieceLink} piece
 * @param {import('./types.js').RequestOptions<StorefrontService>} [options]
 */
export function filecoinInfo({ issuer, with: resource, proofs, audience }: import('./types.js').InvocationConfig, piece: import('@web3-storage/data-segment').PieceLink, options?: import("./types.js").RequestOptions<import("./types.js").StorefrontService> | undefined): Promise<import("@ucanto/interface").Receipt<import("@web3-storage/capabilities/types").FilecoinInfoSuccess, import("@ucanto/interface").HandlerNotFound | import("@ucanto/interface").HandlerExecutionError | import("@ucanto/client").InvalidAudience | import("@ucanto/client").Unauthorized | import("@web3-storage/capabilities/types").FilecoinInfoFailure, import("@ucanto/interface").Invocation<import("@ucanto/client").Capability<import("@ucanto/client").Ability, `${string}:${string}`, unknown>>, import("@ucanto/client").SigAlg>>;
/**
 * @typedef {import('./types.js').StorefrontService} StorefrontService
 * @typedef {import('@ucanto/interface').ConnectionView<StorefrontService>} ConnectionView
 */
/** @type {ConnectionView} */
export const connection: import("@ucanto/interface").ConnectionView<import("./types.js").StorefrontService>;
export type StorefrontService = import('./types.js').StorefrontService;
export type ConnectionView = import('@ucanto/interface').ConnectionView<StorefrontService>;
//# sourceMappingURL=storefront.d.ts.map