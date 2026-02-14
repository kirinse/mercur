import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { AdminOrder, AdminOrderListResponse } from '@medusajs/types';
import {
  Container,
  Divider,
  Heading,
  createDataTableColumnHelper
} from '@medusajs/ui';

import { DataTable } from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table';
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
import { useOrderTableFilters } from '../../../../../../../../node_modules/@medusajs/dashboard/src/hooks/table/filters';
import { formatDate } from '../../../lib/date';
import { OrderStatusBadge } from './order-status-badge';

const PAGE_SIZE = 10;

export const SellerOrdersSection = ({
  seller_orders
}: {
  seller_orders: AdminOrderListResponse;
}) => {
  const { orders, count } = seller_orders;

  const columns = useColumns();
  const filters = useOrderTableFilters();

  return (
    <Container className="mt-2 px-0" data-testid="seller-orders-section">
      <div className="px-8 pb-4" data-testid="seller-orders-section-header">
        <Heading data-testid="seller-orders-section-heading">Orders</Heading>
      </div>
      <Divider />
      <DataTable
        data={orders}
        columns={columns}
        getRowId={(row) => row.id}
        rowCount={count}
        // @ts-expect-error mismatch type
        filters={filters}
        pageSize={PAGE_SIZE}
        isLoading={false}
        // navigateTo={(row) => `/orders/${row.id}`}
        // orderBy={[
        //   { key: "display_id", label: "Order" },
        //   { key: "created_at", label: "Created" },
        //   { key: "updated_at", label: "Updated" },
        // ]}
        // prefix={PREFIX}
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
        header: t('fields.createdAt'),
        cell: ({ row }) => formatDate(row.original.created_at, 'MMM d, yyyy')
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
        // cell: ({ row }) => (
        //   <PaymentStatusBadge status={row.original?.payment_status || "-"} />
        // ),
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
