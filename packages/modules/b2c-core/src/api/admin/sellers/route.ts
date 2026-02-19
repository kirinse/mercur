import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString
} from '@medusajs/framework/utils';

import { AdminSellerParamsType } from './validators';

/**
 * @oas [get] /admin/sellers
 * operationId: "AdminListSellers"
 * summary: "List Sellers"
 * description: "Retrieves a list of sellers."
 * x-authenticated: true
 * parameters:
 *   - name: offset
 *     in: query
 *     schema:
 *       type: number
 *     required: false
 *     description: The number of items to skip before starting to collect the result set.
 *   - name: q
 *     in: query
 *     schema:
 *       type: string
 *     required: false
 *     description: search keyword.
 *   - name: limit
 *     in: query
 *     schema:
 *       type: number
 *     required: false
 *     description: The number of items to return.
 *   - name: fields
 *     in: query
 *     schema:
 *       type: string
 *     required: false
 *     description: Comma-separated fields to include in the response.
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             sellers:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/VendorSeller"
 *             count:
 *               type: integer
 *               description: The total number of items available
 *             offset:
 *               type: integer
 *               description: The number of items skipped before these items
 *             limit:
 *               type: integer
 *               description: The number of items per page
 * tags:
 *   - Admin Sellers
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export async function GET(
  req: MedusaRequest<AdminSellerParamsType>,
  res: MedusaResponse
): Promise<void> {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
  const query = remoteQueryObjectFromString({
    entryPoint: 'seller',
    variables: {
      filters: req.filterableFields,
      ...req.queryConfig.pagination
    },
    fields: req.queryConfig.fields
  });

  const { rows: sellers, metadata } = await remoteQuery(query);

  // const { data: sellers, metadata } = await query.graph({
  //   entity: 'seller',
  //   fields: req.queryConfig.fields,
  //   pagination: req.queryConfig.pagination
  // });

  res.json({
    sellers,
    count: metadata!.count,
    offset: metadata!.skip,
    limit: metadata!.take
  });
}
