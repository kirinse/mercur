import { TypesenseIndexType } from './index-types';

export const TYPESENSE_MODULE = 'typesense';

export type TypesenseSearchResult<T> = {
  hits: T[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  facets?: Record<string, Record<string, number>>;
  facets_stats?: Record<
    string,
    { min: number; max: number; avg: number; sum: number }
  >;
  processingTimeMS: number;
  query: string;
};

export interface ITypesenseModuleService {
  search<T = Record<string, unknown>>(
    indexName: TypesenseIndexType,
    params: Record<string, unknown>
  ): Promise<TypesenseSearchResult<T>>;
}
