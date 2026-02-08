import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

import { CreateCommissionLineDTO } from '@mercurjs/framework';

import {
  COMMISSION_MODULE,
  CommissionModuleService
} from '../../../modules/commission';

export const createCommissionLinesStep = createStep(
  'create-commission-lines',
  async (input: CreateCommissionLineDTO[], { container }) => {
    const service = container.resolve(
      COMMISSION_MODULE
    ) as CommissionModuleService;

    // @ts-expect-error BigNumber incompatible interface
    const result = await service.createCommissionLines(input);

    return new StepResponse(result);
  }
);
