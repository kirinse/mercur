import { BigNumberInput } from '@medusajs/framework/types';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

import { CreatePayoutReversalDTO, PayoutDTO } from '@mercurjs/framework';

import { PAYOUT_MODULE, PayoutModuleService } from '../../../modules/payout';

type CreatePayoutReversalStepInput = {
  payout_id: string | null;
  amount: BigNumberInput;
  currency_code: string;
};

export const createPayoutReversalStep = createStep(
  'create-payout-reversal',
  async (input: CreatePayoutReversalStepInput, { container }) => {
    const service = container.resolve<PayoutModuleService>(PAYOUT_MODULE);

    if (input.payout_id === null) {
      return new StepResponse();
    }

    let payoutReversal: PayoutDTO | null = null;
    let err = false;

    try {
      payoutReversal = await service.createPayoutReversal(
        input as CreatePayoutReversalDTO
      );
    } catch {
      err = true;
    }

    return new StepResponse({
      payoutReversal,
      err
    });
  }
);
