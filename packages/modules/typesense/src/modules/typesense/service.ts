import Typesense, {
  Client,
  CollectionCreateSchema,
  CollectionUpdateSchema,
  SearchParams
} from 'typesense';
import {
  NodeConfiguration,
  NodeConfigurationWithHostname,
  NodeConfigurationWithUrl
} from 'typesense/lib/Typesense/Configuration';

import { TypesenseEntity, TypesenseIndexType } from '@mercurjs/framework';

type ModuleOptions = {
  apiKey: string;
  nodes:
    | NodeConfiguration[]
    | NodeConfigurationWithHostname[]
    | NodeConfigurationWithUrl[];
};

export const defaultProductSchema: CollectionCreateSchema = {
  name: TypesenseIndexType.PRODUCT,
  // fields: [{ name: '.*', type: 'auto' }]
  fields: [
    { name: 'title', type: 'string' },
    { name: 'subtitle', type: 'string' },
    { name: 'tags.value', type: 'string', facet: true },
    { name: 'type.value', type: 'string', facet: true },
    { name: 'categories.name', type: 'string' },
    { name: 'collection.title', type: 'string' },
    { name: 'variants.title', type: 'string' }
  ]
};

export const defaultReviewSchema: CollectionCreateSchema = {
  name: TypesenseIndexType.REVIEW,
  fields: [
    {
      name: 'reference_id',
      type: 'auto',
      facet: true
    },
    {
      name: 'reference',
      type: 'auto',
      facet: true
    }
  ]
};

class TypesenseModuleService {
  private options_: ModuleOptions;
  private typesense_: Client;

  constructor(options: ModuleOptions) {
    this.options_ = options;
    this.typesense_ = new Typesense.Client(options);
  }

  getApiKey() {
    return this.options_.apiKey;
  }

  checkIndex(index: TypesenseIndexType) {
    return this.typesense_.collections(index).exists();
  }

  updateSchema(index: TypesenseIndexType, schema: CollectionUpdateSchema) {
    return this.typesense_.collections(index).update(schema);
  }

  batch(
    type: TypesenseIndexType,
    toAdd: TypesenseEntity[],
    toDelete: string[]
  ) {
    return Promise.all([
      this.typesense_
        .collections(type)
        .documents()
        .import(toAdd, { action: 'create' }),
      this.typesense_
        .collections(type)
        .documents()
        .delete({ filter_by: `id: [${toDelete.join(',')}}]` })
    ]);
  }

  batchUpsert(type: TypesenseIndexType, entities: TypesenseEntity[]) {
    return this.typesense_
      .collections(type)
      .documents()
      .import(entities, { action: 'upsert' });
  }

  batchDelete(type: TypesenseIndexType, ids: string[]) {
    return this.typesense_
      .collections(type)
      .documents()
      .delete({ filter_by: `id: [${ids.join(',')}}]` });
  }

  upsert(type: TypesenseIndexType, entity: TypesenseEntity) {
    return this.typesense_
      .collections(type)
      .documents()
      .create(entity, { action: 'upsert' });
  }

  delete(type: TypesenseIndexType, id: string) {
    return this.typesense_.collections(type).documents(id).delete();
  }

  partialUpdate(
    type: TypesenseIndexType,
    entity: Partial<TypesenseEntity> & { id: string }
  ) {
    return this.typesense_
      .collections(type)
      .documents(entity.id)
      .update(entity);
  }

  search(indexName: TypesenseIndexType, params: SearchParams<TypesenseEntity>) {
    // TODO: To fix this type error??
    // @ts-expect-error type mismatch
    return this.typesense_.collections(indexName).documents().search(params);
  }
}

export default TypesenseModuleService;
