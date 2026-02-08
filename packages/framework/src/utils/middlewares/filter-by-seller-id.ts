import {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse
} from '@medusajs/framework/http';

import { fetchSellerByAuthActorId } from '../seller';

/**
 * @desc Adds a seller id to the filterable fields
 */
export function filterBySellerId() {
  return async (
    req: AuthenticatedMedusaRequest,
    _: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    const seller = await fetchSellerByAuthActorId(
      req.auth_context.actor_id,
      req.scope
    );

    req.filterableFields.seller_id = seller.id;

    return next();
  };
}
