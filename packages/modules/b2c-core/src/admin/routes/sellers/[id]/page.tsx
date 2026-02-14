import {
  LoaderFunctionArgs,
  UIMatch,
  useLoaderData,
  useParams
} from 'react-router-dom';

import { Spinner } from '@medusajs/icons';
import type {
  AdminCustomerGroupListResponse,
  AdminOrderListResponse,
  AdminProductListResponse
} from '@medusajs/types';

import { sdk } from '../../../../../../../../node_modules/@medusajs/dashboard/src/lib/client';
import {
  useSellerCustomerGroups,
  useSellerOrders,
  useSellerProducts
} from '../../../hooks/api/sellers';
import { useSellerOrdersTableQuery } from '../../../hooks/table/query';
import { VendorSeller } from '../../../types/seller';
import { SellerCustomerGroupsSection } from '../_components/seller-customer-groups-section';
import { SellerGeneralSection } from '../_components/seller-general-section';
import { SellerOrdersSection } from '../_components/seller-orders-section';
import { SellerProductsSection } from '../_components/seller-products-section';

const PAGE_SIZE = 10;
const ORDER_PREFIX = 'so';
const PRODUCT_PREFIX = 'sp';
const CUSTOMER_GROUP_PREFIX = 'scg';

const SellerDetails = () => {
  const { id } = useParams();

  const { searchParams: orderSearchParams } = useSellerOrdersTableQuery({
    pageSize: PAGE_SIZE,
    offset: 0,
    prefix: ORDER_PREFIX
  });

  const { searchParams: productSearchParams } = useSellerOrdersTableQuery({
    pageSize: PAGE_SIZE,
    offset: 0,
    prefix: PRODUCT_PREFIX
  });

  const { searchParams: customerGroupSearchParams } = useSellerOrdersTableQuery(
    {
      pageSize: PAGE_SIZE,
      offset: 0,
      prefix: CUSTOMER_GROUP_PREFIX
    }
  );

  const { seller: data } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;

  const { data: orders, isLoading: ordersLoading } = useSellerOrders(
    id!,
    {
      fields:
        'id,display_id,created_at,updated_at,*customer,currency_code,total,fulfillment_status,payment_status,status,region_id,sales_channel_id'
    },
    orderSearchParams
  );

  const {
    data: products,
    isLoading: productsLoading,
    refetch: productsRefetch
  } = useSellerProducts(
    id!,
    {
      fields:
        '*collection,+type_id,+tag_id,+sales_channel_id,+status,+created_at,+updated_at'
    },
    productSearchParams
  );

  const {
    data: customerGroups,
    isLoading: customerGroupsLoading,
    refetch: customerGroupsRefetch
  } = useSellerCustomerGroups(
    id!,
    {
      fields: 'id,name,description,created_at,updated_at,*customers'
    },
    customerGroupSearchParams
  );

  if (!data || ordersLoading || productsLoading || customerGroupsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="text-ui-fg-interactive animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SellerGeneralSection seller={data} />
      <SellerOrdersSection seller_orders={orders as AdminOrderListResponse} />
      <SellerProductsSection
        seller_products={products as AdminProductListResponse}
        refetch={productsRefetch}
      />
      <SellerCustomerGroupsSection
        seller_customer_groups={
          customerGroups as AdminCustomerGroupListResponse
        }
        refetch={customerGroupsRefetch}
      />
    </>
  );
};

export default SellerDetails;

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const { seller } = await sdk.client.fetch<{ seller: VendorSeller }>(
    `/admin/sellers/${id}`,
    {
      method: 'GET',
      query: {
        fields:
          'id,email,name,created_at,store_status,description,handle,phone,address_line,city,country_code,postal_code,tax_id'
      }
    }
  );

  return {
    seller
  };
}

export const handle = {
  breadcrumb: ({
    data
  }: UIMatch<{
    seller: VendorSeller;
  }>) => data.seller.name || data.seller.email || 'Seller'
};
