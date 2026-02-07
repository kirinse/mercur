import { Module } from '@medusajs/framework/utils';

import TypesenseModuleService from './service';

export const TYPESENSE_MODULE = 'algolia';
export { defaultProductSettings, defaultReviewSettings } from './service';
export { TypesenseModuleService };

export default Module(TYPESENSE_MODULE, {
  service: TypesenseModuleService
});
