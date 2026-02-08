import { MedusaRequest, MedusaResponse } from '@medusajs/framework';

import { TypesenseIndexType } from '@mercurjs/framework';

import {
  TYPESENSE_MODULE,
  TypesenseModuleService
} from '../../../modules/typesense';
import { syncTypesenseWorkflow } from '../../../workflows/typesense/workflows/sync-typesense';

/**
 * @oas [post] /admin/typesense
 * operationId: "AdminSyncTypesense"
 * summary: "Sync Typesense"
 * description: "Initiates a synchronization process for Typesense collections."
 * x-authenticated: true
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Confirmation message that sync is in progress
 *               example: "Sync in progress"
 * tags:
 *   - Admin Typesense
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  await syncTypesenseWorkflow.run({
    container: req.scope
  });

  res.status(200).json({ message: 'Sync in progress' });
};

/**
 * @oas [get] /admin/typesense
 * operationId: "AdminGetTypesenseStatus"
 * summary: "Get Typesense Status"
 * description: "Retrieves the current status of Typesense configuration and product index."
 * x-authenticated: true
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             productIndex:
 *               type: object
 *               description: The status of the product index
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: Whether the product index exists
 *                 name:
 *                   type: string
 *                   description: The name of the product index
 * tags:
 *   - Admin Typesense
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const typesenseService =
    req.scope.resolve<TypesenseModuleService>(TYPESENSE_MODULE);

  const productIndex = await typesenseService.checkIndex(
    TypesenseIndexType.PRODUCT
  );
  res.status(200).json({ productIndex });
};
