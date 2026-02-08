import { defineLink } from '@medusajs/framework/utils';

import { SellerModuleSellerLinkable } from '@mercurjs/framework';

import ReviewModule from '../modules/reviews';

export default defineLink(SellerModuleSellerLinkable, {
  linkable: ReviewModule.linkable.review,
  isList: true
});
