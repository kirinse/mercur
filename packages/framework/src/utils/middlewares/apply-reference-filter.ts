import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse
} from '@medusajs/framework/http';

/**
 * @desc Adds reference type filterableFileds
 */
export function applyReferenceFilter() {
  return async (
    req: MedusaRequest,
    _: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    if (req.validatedQuery.reference) {
      req.filterableFields.reference = req.validatedQuery.reference;
    }
    return next();
  };
}
