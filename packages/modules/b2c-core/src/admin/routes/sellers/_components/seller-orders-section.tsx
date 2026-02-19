import type { AdminOrder } from '@medusajs/types';
import {
  Container,
  DataTableFilter,
  createDataTableColumnHelper
} from '@medusajs/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table';
import { useDataTableDateFilters } from "../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table/helpers/general/use-data-table-date-filters";
import {
  DateCell,
  DateHeader
} from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/table/table-cells/common/date-cell';
import {
  FulfillmentStatusCell,
  FulfillmentStatusHeader
} from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/table/table-cells/order/fulfillment-status-cell';
import {
  PaymentStatusCell,
  PaymentStatusHeader
} from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/table/table-cells/order/payment-status-cell';
import {
  TotalCell,
  TotalHeader
} from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/table/table-cells/order/total-cell';
import { useCustomers } from "../../../../../../../../node_modules/@medusajs/dashboard/src/hooks/api/customers";
import { useRegions } from "../../../../../../../../node_modules/@medusajs/dashboard/src/hooks/api/regions";
import { useSalesChannels } from "../../../../../../../../node_modules/@medusajs/dashboard/src/hooks/api/sales-channels";
import { useSellerOrders } from '../../../hooks/api/sellers';
import { useSellerOrdersTableQuery } from '../../../hooks/table/query';
import { OrderStatusBadge } from './order-status-badge';

const PAGE_SIZE = 10;
const PREFIX = "so";

export const SellerOrdersSection = ({
  id
}: {
  id: string;
}) => {
  const { t } = useTranslation('b2c');
  const { searchParams } = useSellerOrdersTableQuery({
    pageSize: PAGE_SIZE,
    offset: 0,
    prefix: PREFIX
  });
  const { data, isLoading } = useSellerOrders(
    id!,
    {
      fields:
        'id,display_id,created_at,updated_at,*customer,currency_code,total,fulfillment_status,payment_status,status,region_id,sales_channel_id',
      ...searchParams
    },
  );

  const columns = useColumns();

  const filters = useFilters();

  return (
    <Container className="mt-2 px-0" data-testid="seller-orders-section">
      <DataTable
        data={data?.orders}
        columns={columns}
        getRowId={(row) => row.id}
        rowCount={data?.orders.length}
        filters={filters}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        rowHref={({ id }) => `/orders/${id}`}
        heading={t('orders.domain')}
        emptyState={{
          empty: {
            heading: t("seller.orders.list.empty.heading"),
            description: t("seller.orders.list.empty.description"),
          },
          filtered: {
            heading: t("seller.orders.list.filtered.heading"),
            description: t("seller.orders.list.filtered.description"),
          },
        }}
        enableFilterMenu={false}
        prefix={PREFIX}
      />
    </Container>
  );
};

const columnHelper = createDataTableColumnHelper<AdminOrder>();

const useColumns = () => {
  const { t } = useTranslation('b2c');
  return useMemo(
    () => [
      columnHelper.accessor('display_id', {
        header: t('fields.order')
      }),
      columnHelper.accessor('created_at', {
        header: () => <DateHeader />,
        cell: ({ row }) => <DateCell date={new Date(row.original.created_at)} />
      }),
      columnHelper.accessor('customer', {
        header: t('fields.customer'),
        cell: ({ row }) => {
          return row.original.customer?.first_name &&
            row.original.customer?.last_name
            ? `${row.original.customer?.first_name} ${row.original.customer?.last_name}`
            : row.original.customer?.email;
        }
      }),
      columnHelper.accessor('status', {
        header: t('fields.status'),
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />
      }),

      columnHelper.accessor('payment_status', {
        header: () => <PaymentStatusHeader />,
        cell: ({ getValue }) => {
          const status = getValue();
          return <PaymentStatusCell status={status} />;
        }
      }),
      columnHelper.accessor('fulfillment_status', {
        header: () => <FulfillmentStatusHeader />,
        cell: ({ row }) => (
          <FulfillmentStatusCell
            status={row.original.fulfillment_status || '-'}
          />
        )
      }),
      columnHelper.accessor('total', {
        header: () => <TotalHeader />,
        cell: ({ getValue, row }) => {
          const isFullyRefunded = row.original.payment_status === 'refunded';
          const total = !isFullyRefunded
            ? getValue()
            : row.original.payment_collections?.reduce(
              (acc, payCol) => acc + (payCol.refunded_amount ?? 0),
              0
            ) || 0;
          const currencyCode = row.original.currency_code;

          return (
            <TotalCell
              currencyCode={currencyCode}
              total={total}
              className={isFullyRefunded ? 'text-ui-fg-muted line-through' : ''}
            />
          );
        }
      })
    ],
    []
  );
};

const useFilters = (): DataTableFilter[] => {
  const { t } = useTranslation('b2c');
  const dateFilterOptions = useDataTableDateFilters()

  const { customers } = useCustomers(
    {
      limit: 1000,
      fields: "id,email",
    },
    {
      throwOnError: true,
    }
  )

  const { sales_channels } = useSalesChannels(
    {
      limit: 1000,
      fields: "id,name",
    },
    {
      throwOnError: true,
    }
  )

  const { regions } = useRegions(
    {
      limit: 1000,
      fields: "id,name",
    },
    { throwOnError: true }
  )

  return useMemo(() => {
    return [
      {
        id: "customer_id",
        label: t("customers.domain"),
        options:
          customers?.map((customer) => ({
            label: customer.email,
            value: customer.id,
          })) ?? [],
        type: "select",
      },
      {
        id: "sales_channel_id",
        label: t("salesChannels.domain"),
        options:
          sales_channels?.map((sales_channel) => ({
            label: sales_channel.name,
            value: sales_channel.id,
          })) ?? [],
        type: "select",
      },
      {
        id: "region_id",
        label: t("regions.domain"),
        options:
          regions?.map((region) => ({
            label: region.name,
            value: region.id,
          })) ?? [],
        type: "select",
      },
      ...dateFilterOptions,
    ] satisfies DataTableFilter[]
  }, [customers, sales_channels, regions, dateFilterOptions])
}