import { z } from '@medusajs/framework/zod';
import { AdminGetCustomerGroupsParamsFields } from '@medusajs/medusa/api/admin/customer-groups/validators';
import { AdminGetOrdersParams } from '@medusajs/medusa/api/admin/orders/validators';
import { AdminGetProductsParamsDirectFields } from '@medusajs/medusa/api/admin/products/validators';
import { applyAndAndOrOperators } from '@medusajs/medusa/api/utils/common-validators/common';
import {
  GetProductsParams,
  transformProductParams
} from '@medusajs/medusa/api/utils/common-validators/index';
import {
  createFindParams,
  createOperatorMap
} from '@medusajs/medusa/api/utils/validators';

import { Hosts, StoreStatus, buildHostAddress } from '@mercurjs/framework';

export type AdminSellerParamsType = z.infer<typeof AdminSellerParams>;
export const AdminSellerParams = createFindParams({
  offset: 0,
  limit: 50
}).merge(
  z.object({
    q: z.string().optional(),
    id: z.union([z.string(), z.array(z.string())]).optional(),
    created_at: createOperatorMap().optional(),
    updated_at: createOperatorMap().optional(),
    deleted_at: createOperatorMap().optional(),
    email: z.string().nullish(),
    name: z.string().nullish()
  })
);

export type AdminGetSellerProductsParamsType = z.infer<
  typeof AdminGetSellerProductsParams
>;
export const AdminGetSellerProductsParams = createFindParams({
  offset: 0,
  limit: 50
})
  .merge(AdminGetProductsParamsDirectFields)
  .merge(
    z
      .object({
        price_list_id: z.string().array().optional()
      })
      .merge(applyAndAndOrOperators(AdminGetProductsParamsDirectFields))
      .merge(GetProductsParams)
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .transform(transformProductParams as any);

export type AdminGetSellerOrdersParamsType = z.infer<
  typeof AdminGetSellerOrdersParams
>;
export const AdminGetSellerOrdersParams = createFindParams({
  offset: 0,
  limit: 50
}).merge(AdminGetOrdersParams);

export type AdminGetSellerCustomerGroupsParamsType = z.infer<
  typeof AdminGetSellerCustomerGroupsParams
>;
export const AdminGetSellerCustomerGroupsParams = createFindParams({
  offset: 0,
  limit: 50
}).merge(AdminGetCustomerGroupsParamsFields)
  .merge(applyAndAndOrOperators(AdminGetCustomerGroupsParamsFields));

export type AdminUpdateSellerType = z.infer<typeof AdminUpdateSeller>;
export const AdminUpdateSeller = z
  .object({
    name: z
      .preprocess((val: string) => val.trim(), z.string().min(4))
      .optional(),
    description: z.string().optional(),
    photo: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address_line: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country_code: z.string().optional(),
    tax_id: z.string().optional(),
    store_status: z.nativeEnum(StoreStatus).optional()
  })
  .strict();

export type AdminInviteSellerType = z.infer<typeof AdminInviteSeller>;
export const AdminInviteSeller = z.object({
  email: z.string().email(),
  registration_url: z
    .string()
    .default(buildHostAddress(Hosts.VENDOR_PANEL, '/register').toString())
});
