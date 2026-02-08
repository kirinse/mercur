import { defineLink } from '@medusajs/framework/utils';

import { SellerModuleSellerLinkable } from '@mercurjs/framework';

import orderReturnRequest from '../modules/order-return-request';

export default defineLink(SellerModuleSellerLinkable, {
  linkable: orderReturnRequest.linkable.orderReturnRequest,
  isList: true
});
