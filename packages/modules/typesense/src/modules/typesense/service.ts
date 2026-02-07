import {
  Action,
  Algoliasearch,
  BatchRequest,
  IndexSettings,
  SearchParams,
  SearchResponse,
  algoliasearch
} from 'algoliasearch';

import { TypesenseEntity, TypesenseIndexType } from '@mercurjs/framework';

type ModuleOptions = {
  appId: string;
  apiKey: string;
};

export const defaultProductSettings: IndexSettings = {
  searchableAttributes: [
    'title',
    'subtitle',
    'tags.value',
    'type.value',
    'categories.name',
    'collection.title',
    'variants.title'
  ]
};

export const defaultReviewSettings: IndexSettings = {
  attributesForFaceting: ['filterOnly(reference_id)', 'filterOnly(reference)']
};

class TypesenseModuleService {
  private options_: ModuleOptions;
  private algolia_: Algoliasearch;

  constructor(_, options: ModuleOptions) {
    this.options_ = options;
    this.algolia_ = algoliasearch(this.options_.appId, this.options_.apiKey);
  }

  getAppId() {
    return this.options_.appId;
  }

  checkIndex(index: TypesenseIndexType) {
    return this.algolia_.indexExists({
      indexName: index
    });
  }

  updateSettings(index: TypesenseIndexType, settings: IndexSettings) {
    return this.algolia_.setSettings({
      indexName: index,
      indexSettings: settings
    });
  }

  batch(
    type: TypesenseIndexType,
    toAdd: TypesenseEntity[],
    toDelete: string[]
  ) {
    const addRequests: BatchRequest[] = toAdd.map((entity) => {
      return {
        action: 'addObject' as Action,
        objectID: entity.id,
        body: entity
      };
    });

    const deleteRequests: BatchRequest[] = toDelete.map((id) => {
      return {
        action: 'deleteObject' as Action,
        objectID: id,
        body: {}
      };
    });

    const requests = [...addRequests, ...deleteRequests];

    return this.algolia_.batch({
      indexName: type,
      batchWriteParams: {
        requests
      }
    });
  }

  batchUpsert(type: TypesenseIndexType, entities: TypesenseEntity[]) {
    return this.algolia_.batch({
      indexName: type,
      batchWriteParams: {
        requests: entities.map((entity) => {
          return {
            action: 'addObject',
            objectID: entity.id,
            body: entity
          };
        })
      }
    });
  }

  batchDelete(type: TypesenseIndexType, ids: string[]) {
    return this.algolia_.batch({
      indexName: type,
      batchWriteParams: {
        requests: ids.map((id) => {
          return {
            action: 'deleteObject',
            objectID: id,
            body: {}
          };
        })
      }
    });
  }

  upsert(type: TypesenseIndexType, entity: TypesenseEntity) {
    return this.algolia_.addOrUpdateObject({
      indexName: type,
      objectID: entity.id,
      body: entity
    });
  }

  delete(type: TypesenseIndexType, id: string) {
    return this.algolia_.deleteObject({
      indexName: type,
      objectID: id
    });
  }

  partialUpdate(
    type: TypesenseIndexType,
    entity: Partial<TypesenseEntity> & { id: string }
  ) {
    return this.algolia_.partialUpdateObject({
      indexName: type,
      objectID: entity.id,
      attributesToUpdate: { ...entity }
    });
  }

  search<T = Record<string, unknown>>(
    indexName: TypesenseIndexType,
    params: SearchParams
  ): Promise<SearchResponse<T>> {
    return this.algolia_.searchSingleIndex<T>({
      indexName,
      searchParams: params
    });
  }
}

export default TypesenseModuleService;
