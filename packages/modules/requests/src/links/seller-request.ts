import { defineLink } from '@medusajs/framework/utils';

import { SellerModuleSellerLinkable } from '@mercurjs/framework';

import RequestsModule from '../modules/requests';

export default defineLink(SellerModuleSellerLinkable, {
  linkable: RequestsModule.linkable.request,
  isList: true
});
