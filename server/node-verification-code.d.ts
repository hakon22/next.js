/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/// <reference types="node" />
declare module 'node-verification-code' {
    import type { Buffer } from 'node:buffer';

    export type RandomSequenceGeneratorFn = (charCount: number) => string;
    export type ChunkedCodeGeneratorFn = (charCount: number) => Buffer;
}
declare module 'lib/types' {
    import type { Buffer } from 'node:buffer';

    export type RandomSequenceGeneratorFn = (charCount: number) => string;
    export type ChunkedCodeGeneratorFn = (charCount: number) => Buffer;
}
declare module 'lib/createGenerator' {
    import type { RandomSequenceGeneratorFn, ChunkedCodeGeneratorFn } from 'lib/types';

    export const createGenerator: (sequenceGenerator: RandomSequenceGeneratorFn) => ChunkedCodeGeneratorFn;
}
declare module 'lib/sequence' {
    import type { RandomSequenceGeneratorFn } from 'lib/types';

    export const numericSequence: RandomSequenceGeneratorFn;
    export const sequenceFromAlphabet: (alphabet?: any[]) => RandomSequenceGeneratorFn;
}
declare module 'lib/generators' {
    export const getDigitalCode: import('lib/types').ChunkedCodeGeneratorFn;
}
declare module 'lib/index' {
    export * from 'lib/createGenerator';
    export * from 'lib/sequence';
    export * from 'lib/generators';
}
declare module 'node-verification-code' {
    export * from 'lib/index';
}
