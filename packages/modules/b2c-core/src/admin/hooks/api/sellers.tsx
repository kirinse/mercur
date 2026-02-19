/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AdminCustomerGroupListResponse, AdminOrder, HttpTypes } from '@medusajs/types';
import {
  QueryKey,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { sdk } from '../../../../../../../node_modules/@medusajs/dashboard/src/lib/client';
import { queryKeysFactory } from '../../../../../../../node_modules/@medusajs/dashboard/src/lib/query-key-factory';
import { OrderSet } from '../../types/order-set';
import { VendorSeller } from '../../types/seller';

export const sellerQueryKeys = queryKeysFactory('seller');

type SortableOrderFields = 'display_id' | 'created_at' | 'updated_at';
type SortableProductFields = 'title' | 'created_at' | 'updated_at';
type SortableCustomerGroupFields = 'name' | 'created_at' | 'updated_at';

const sortOrders = (orders: any[], order: string) => {
  const field = order.startsWith('-')
    ? (order.slice(1) as SortableOrderFields)
    : (order as SortableOrderFields);
  const isDesc = order.startsWith('-');

  return [...orders].sort((a, b) => {
    const aValue: string | number | null | undefined = a[field];
    const bValue: string | number | null | undefined = b[field];

    // Handle null/undefined values
    if (!aValue && aValue !== '') return isDesc ? -1 : 1;
    if (!bValue && bValue !== '') return isDesc ? 1 : -1;

    // Special handling for dates
    if (field === 'created_at' || field === 'updated_at') {
      const aDate = new Date(String(aValue)).getTime();
      const bDate = new Date(String(bValue)).getTime();
      return isDesc ? bDate - aDate : aDate - bDate;
    }

    // Handle display_id as number
    if (field === 'display_id') {
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      return isDesc ? bNum - aNum : aNum - bNum;
    }

    // Handle string comparison
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();

    if (aString < bString) return isDesc ? 1 : -1;
    if (aString > bString) return isDesc ? -1 : 1;
    return 0;
  });
};

const sortProducts = (products: any[], order: string) => {
  const field = order.startsWith('-')
    ? (order.slice(1) as SortableProductFields)
    : (order as SortableProductFields);
  const isDesc = order.startsWith('-');

  return [...products].sort((a, b) => {
    const aValue: string | number | null | undefined = a[field];
    const bValue: string | number | null | undefined = b[field];

    // Handle null/undefined values
    if (!aValue && aValue !== '') return isDesc ? -1 : 1;
    if (!bValue && bValue !== '') return isDesc ? 1 : -1;

    // Special handling for dates
    if (field === 'created_at' || field === 'updated_at') {
      const aDate = new Date(String(aValue)).getTime();
      const bDate = new Date(String(bValue)).getTime();
      return isDesc ? bDate - aDate : aDate - bDate;
    }

    // Handle string comparison
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();

    if (aString < bString) return isDesc ? 1 : -1;
    if (aString > bString) return isDesc ? -1 : 1;
    return 0;
  });
};

const sortCustomerGroups = (customerGroups: any[], order: string) => {
  const field = order.startsWith('-')
    ? (order.slice(1) as SortableCustomerGroupFields)
    : (order as SortableCustomerGroupFields);
  const isDesc = order.startsWith('-');

  return [...customerGroups].sort((a, b) => {
    const aValue: string | number | null | undefined = a[field];
    const bValue: string | number | null | undefined = b[field];

    // Handle null/undefined values
    if (!aValue && aValue !== '') return isDesc ? -1 : 1;
    if (!bValue && bValue !== '') return isDesc ? 1 : -1;

    // Special handling for dates
    if (field === 'created_at' || field === 'updated_at') {
      const aDate = new Date(String(aValue)).getTime();
      const bDate = new Date(String(bValue)).getTime();
      return isDesc ? bDate - aDate : aDate - bDate;
    }

    // Handle string comparison
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();

    if (aString < bString) return isDesc ? 1 : -1;
    if (aString > bString) return isDesc ? -1 : 1;
    return 0;
  });
};

export const useSellers = (
  query?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<
      { sellers: VendorSeller[]; count?: number },
      Error,
      { sellers: VendorSeller[]; count?: number },
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...other } = useQuery<
    { sellers: VendorSeller[]; count?: number },
    Error,
    { sellers: VendorSeller[]; count?: number }
  >({
    queryKey: sellerQueryKeys.list(query),
    queryFn: () =>
      sdk.client.fetch('/admin/sellers', {
        method: 'GET',
        query
      }),
    ...options
  });

  return {
    sellers: data?.sellers,
    count: data?.count,
    ...other
  };
};

export const sellerQuery = (id: string) => ({
  queryKey: sellerQueryKeys.detail(id),
  queryFn: () =>
    sdk.client.fetch<{ seller: VendorSeller }>(`/admin/sellers/${id}`, {
      method: 'GET',
      query: {
        fields:
          'id,email,name,created_at,store_status,description,handle,phone,address_line,city,country_code,postal_code,tax_id'
      }
    })
});

export const useSeller = (id: string) => {
  const query = sellerQuery(id);
  return useQuery<{ seller: VendorSeller }, Error, { seller: VendorSeller }>({
    ...query
  });
};

export const useSellerOrders = (
  id: string,
  query?: Record<string, unknown>,
) => {
  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders', id, query],
    queryFn: () =>
      sdk.client.fetch<{ orders: AdminOrder[] }>(
        `/admin/sellers/${id}/orders`,
        {
          method: 'GET',
          query
        }
      )
  });

  if (!data?.orders) {
    return { data, isLoading };
  }

  // let processedOrders = [...data.orders];

  // // Apply search filter if present
  // if (filters?.q) {
  //   const searchTerm = String(filters.q).toLowerCase();
  //   processedOrders = processedOrders.filter(
  //     (order) =>
  //       order.customer?.first_name?.toLowerCase().includes(searchTerm) ||
  //       order.customer?.last_name?.toLowerCase().includes(searchTerm) ||
  //       order.customer?.email?.toLowerCase().includes(searchTerm)
  //   );
  // }

  // // Filter by region_id
  // if (filters?.region_id && Array.isArray(filters.region_id)) {
  //   processedOrders = processedOrders.filter(
  //     (order) => order.region_id && filters.region_id.includes(order.region_id)
  //   );
  // }

  // // Filter by sales_channel_id
  // if (filters?.sales_channel_id && Array.isArray(filters.sales_channel_id)) {
  //   processedOrders = processedOrders.filter(
  //     (order) =>
  //       order.sales_channel_id &&
  //       filters.sales_channel_id.includes(order.sales_channel_id)
  //   );
  // }

  // // Filter by created_at date ranges
  // if (filters?.created_at) {
  //   const dateFilter = filters.created_at as any;
  //   if (dateFilter.$gte) {
  //     const filterDate = new Date(dateFilter.$gte);
  //     processedOrders = processedOrders.filter((order) => {
  //       const orderCreatedAt = new Date(order.created_at || '');
  //       return orderCreatedAt >= filterDate;
  //     });
  //   }
  //   if (dateFilter.$lte) {
  //     const filterDate = new Date(dateFilter.$lte);
  //     processedOrders = processedOrders.filter((order) => {
  //       const orderCreatedAt = new Date(order.created_at || '');
  //       return orderCreatedAt <= filterDate;
  //     });
  //   }
  // }

  // // Filter by updated_at date ranges
  // if (filters?.updated_at) {
  //   const dateFilter = filters.updated_at as any;

  //   if (dateFilter.$gte) {
  //     const filterDate = new Date(dateFilter.$gte);
  //     processedOrders = processedOrders.filter((order) => {
  //       const orderUpdatedAt = new Date(order.updated_at || '');
  //       return orderUpdatedAt >= filterDate;
  //     });
  //   }
  //   if (dateFilter.$lte) {
  //     const filterDate = new Date(dateFilter.$lte);
  //     processedOrders = processedOrders.filter((order) => {
  //       const orderUpdatedAt = new Date(order.updated_at || '');
  //       return orderUpdatedAt <= filterDate;
  //     });
  //   }
  // }

  // // Apply sorting if present
  // if (filters?.order) {
  //   const order = String(filters.order);
  //   const validOrders = [
  //     'display_id',
  //     '-display_id',
  //     'created_at',
  //     '-created_at',
  //     'updated_at',
  //     '-updated_at'
  //   ] as const;

  //   if (validOrders.includes(order as (typeof validOrders)[number])) {
  //     processedOrders = sortOrders(processedOrders, order);
  //   }
  // }

  // const offset = Number(filters.offset) || 0;
  // const limit = Number(filters.limit) || 10;

  return {
    data,
    isLoading
  };
};

export const useUpdateSeller = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      sdk.client.fetch(`/admin/sellers/${id}`, { method: 'POST', body: data }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sellerQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: sellerQueryKeys.detail(id) });
    }
  });
};

export const useSellerProducts = (
  id: string,
  query?: Record<string, unknown>,
) => {
  // HACK: for stupid DataTable component from @medusajs/dashboard
  if (query) {
    query = Object.fromEntries(
      Object.entries(query).map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, value.map((v) => v.replace(/[\[\]\"]/gi, ''))];
        }
        return [key, value];
      })
    );
    if (query.sales_channel_id && Array.isArray(query.sales_channel_id)) {
      query.sales_channel_id = query.sales_channel_id[0];
    }
  }

  const { data, isLoading, refetch } = useQuery<HttpTypes.AdminProductListResponse,
    Error,
    HttpTypes.AdminProductListResponse
  >({
    queryKey: ['seller-products', id, query],
    queryFn: () =>
      sdk.client.fetch(`/admin/sellers/${id}/products`, {
        method: 'GET',
        query
      })
  });

  if (!data?.products) {
    return { data, isLoading, refetch };
  }

  // const processedProducts = [...data.products];

  // Apply search filter if present
  // if (filters?.q) {
  //   const searchTerm = String(filters.q).toLowerCase();
  //   processedProducts = processedProducts.filter((product) =>
  //     product.title?.toLowerCase().includes(searchTerm)
  //   );
  // }

  // Filter by tag_id
  // if (filters?.tag_id && Array.isArray(filters.tag_id)) {
  //   processedProducts = processedProducts.filter((product) =>
  //     product.tags?.some((tag: any) => filters.tag_id.includes(tag.id))
  //   );
  // }

  // Filter by type_id
  // if (filters?.type_id && Array.isArray(filters.type_id)) {
  //   processedProducts = processedProducts.filter((product) =>
  //     filters.type_id.includes(product.type_id)
  //   );
  // }

  // Filter by sales_channel_id
  // if (filters?.sales_channel_id && Array.isArray(filters.sales_channel_id)) {
  //   processedProducts = processedProducts.filter((product) =>
  //     product.sales_channels?.some((channel: any) =>
  //       filters.sales_channel_id.includes(channel.id)
  //     )
  //   );
  // }

  // Filter by status
  // if (filters?.status && Array.isArray(filters.status)) {
  //   processedProducts = processedProducts.filter((product) =>
  //     filters.status.includes(product.status)
  //   );
  // }

  // Filter by created_at date ranges
  // if (filters?.created_at) {
  //   const dateFilter = filters.created_at as any;
  //   if (dateFilter.$gte) {
  //     const filterDate = new Date(dateFilter.$gte);
  //     processedProducts = processedProducts.filter((product) => {
  //       const productCreatedAt = new Date(product.created_at || '');
  //       return productCreatedAt >= filterDate;
  //     });
  //   }
  //   if (dateFilter.$lte) {
  //     const filterDate = new Date(dateFilter.$lte);
  //     processedProducts = processedProducts.filter((product) => {
  //       const productCreatedAt = new Date(product.created_at || '');
  //       return productCreatedAt <= filterDate;
  //     });
  //   }
  // }

  // Filter by updated_at date ranges
  // if (filters?.updated_at) {
  //   const dateFilter = filters.updated_at as any;
  //   if (dateFilter.$gte) {
  //     const filterDate = new Date(dateFilter.$gte);
  //     processedProducts = processedProducts.filter((product) => {
  //       const productUpdatedAt = new Date(product.updated_at || '');
  //       return productUpdatedAt >= filterDate;
  //     });
  //   }
  //   if (dateFilter.$lte) {
  //     const filterDate = new Date(dateFilter.$lte);
  //     processedProducts = processedProducts.filter((product) => {
  //       const productUpdatedAt = new Date(product.updated_at || '');
  //       return productUpdatedAt <= filterDate;
  //     });
  //   }
  // }

  // Apply sorting if present
  // if (filters?.order) {
  //   const order = String(filters.order);
  //   const validOrders = [
  //     'title',
  //     '-title',
  //     'created_at',
  //     '-created_at',
  //     'updated_at',
  //     '-updated_at'
  //   ] as const;

  //   if (validOrders.includes(order as (typeof validOrders)[number])) {
  //     processedProducts = sortProducts(processedProducts, order);
  //   }
  // }

  // Apply pagination
  // const offset = Number(filters?.offset) || 0;
  // const limit = Number(filters?.limit) || 10;

  return {
    data,
    isLoading,
    refetch
  };
};

export const useSellerCustomerGroups = (
  id: string,
  query?: Record<string, unknown>,
) => {
  const { data, isLoading, refetch } = useQuery<
    AdminCustomerGroupListResponse,
    Error,
    AdminCustomerGroupListResponse
  >({
    queryKey: ['seller-customer-groups', id, query],
    queryFn: () =>
      sdk.client.fetch(`/admin/sellers/${id}/customer-groups`, {
        method: 'GET',
        query
      })
  });

  if (!data?.customer_groups) {
    return {
      data,
      isLoading,
      refetch
    };
  }

  return {
    data,
    isLoading,
    refetch
  };
};

export const useInviteSeller = () => {
  return useMutation({
    mutationFn: ({
      email,
      registration_url = undefined
    }: {
      email: string;
      registration_url?: string;
    }) =>
      sdk.client.fetch('/admin/sellers/invite', {
        method: 'POST',
        body: { email, registration_url }
      })
  });
};

export const useOrderSet = (id: string) => {
  return useQuery<
    { order_sets: OrderSet[] },
    Error,
    { order_sets: OrderSet[] }
  >({
    queryKey: ['order-set', id],
    queryFn: () =>
      sdk.client.fetch(`/admin/order-sets?order_id=${id}`, {
        method: 'GET'
      })
  });
};
