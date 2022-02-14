// @ts-ignore
import * as sc from '@ungap/structured-clone';

export type Optional<T> = T | undefined;
export const structuredClone = <T>(o: T): T => sc.default(o) as T;