import { Module } from '@medusajs/framework/utils';

import { TYPESENSE_MODULE } from '@mercurjs/framework';

import TypesenseModuleService from './service';

export { defaultProductSchema, defaultReviewSchema } from './service';
export { TypesenseModuleService };

export default Module(TYPESENSE_MODULE, {
  service: TypesenseModuleService
});

export { TYPESENSE_MODULE };
