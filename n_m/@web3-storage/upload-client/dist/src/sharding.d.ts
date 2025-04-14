/**
 * Shard a set of blocks into a set of CAR files. By default the last block
 * received is assumed to be the DAG root and becomes the CAR root CID for the
 * last CAR output. Set the `rootCID` option to override.
 *
 * @extends {TransformStream<import('@ipld/unixfs').Block, import('./types.js').IndexedCARFile>}
 */
export class ShardingStream extends TransformStream<import("@ipld/unixfs").Block<any, number, number, import("multiformats").Version>, import("./types.js").IndexedCARFile> {
    /**
     * @param {import('./types.js').ShardingOptions} [options]
     */
    constructor(options?: import("./types.js").ShardingOptions | undefined);
}
export function defaultFileComparator(a: FileLike, b: FileLike, getComparedValue?: (file: FileLike) => string): 0 | 1 | -1;
export type FileLike = import('./types.js').FileLike;
//# sourceMappingURL=sharding.d.ts.map