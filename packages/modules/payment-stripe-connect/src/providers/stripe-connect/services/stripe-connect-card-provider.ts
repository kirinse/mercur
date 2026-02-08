import { PaymentIntentOptions, PaymentProviderKeys } from '@mercurjs/framework';

import StripeConnectProvider from '../core/stripe-connect-provider';

class StripeConnectCardProviderService extends StripeConnectProvider {
  static identifier = PaymentProviderKeys.CARD;

  constructor(_, options) {
    super(_, options);
  }

  get paymentIntentOptions(): PaymentIntentOptions {
    return {
      payment_method_types: ['card']
    };
  }
}

export default StripeConnectCardProviderService;
