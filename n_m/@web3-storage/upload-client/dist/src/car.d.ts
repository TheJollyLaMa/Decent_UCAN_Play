/** @param {import('./types.js').AnyLink} [root] */
export function headerEncodingLength(root?: import("./types.js").AnyLink | undefined): number;
/** @param {Block} block */
export function blockHeaderEncodingLength(block: Block): number;
/** @param {Block} block */
export function blockEncodingLength(block: Block): number;
/**
 * @param {Iterable<Block> | AsyncIterable<Block>} blocks
 * @param {import('./types.js').AnyLink} [root]
 * @returns {Promise<import('./types.js').CARFile>}
 */
export function encode(blocks: Iterable<Block> | AsyncIterable<Block>, root?: import("./types.js").AnyLink | undefined): Promise<import('./types.js').CARFile>;
/**
 * @typedef {import('@ipld/unixfs').Block} Block
 */
export const code: 514;
/** @extends {ReadableStream<Block>} */
export class BlockStream extends ReadableStream<import("@ipld/unixfs").Block<any, number, number, import("multiformats").Version>> {
    /** @param {import('./types.js').BlobLike} car */
    constructor(car: import('./types.js').BlobLike);
    /** @returns {Promise<import('./types.js').AnyLink[]>} */
    getRoots: () => Promise<import('./types.js').AnyLink[]>;
}
export type Block = import('@ipld/unixfs').Block;
//# sourceMappingURL=car.d.ts.map