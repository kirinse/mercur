import { Module } from '@medusajs/framework/utils';

import { ConfigurationRuleDefaults } from '@mercurjs/framework';

import ConfigurationModuleService from './service';

export const CONFIGURATION_MODULE = 'configuration';
export { ConfigurationModuleService, ConfigurationRuleDefaults };

export default Module(CONFIGURATION_MODULE, {
  service: ConfigurationModuleService
});
