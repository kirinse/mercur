import { MedusaService } from '@medusajs/framework/utils';

import {
  ConfigurationRuleDefaults,
  ConfigurationRuleType
} from '@mercurjs/framework';

import { ConfigurationRule } from './models';

class ConfigurationModuleService extends MedusaService({
  ConfigurationRule
}) {
  async isRuleEnabled(type: ConfigurationRuleType): Promise<boolean> {
    const [rule] = await this.listConfigurationRules({
      rule_type: type
    });
    return rule ? rule.is_enabled : ConfigurationRuleDefaults.get(type)!;
  }
}

export default ConfigurationModuleService;
