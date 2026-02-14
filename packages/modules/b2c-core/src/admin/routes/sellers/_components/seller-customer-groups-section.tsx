import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { PencilSquare, Trash } from '@medusajs/icons';
import type {
  AdminCustomerGroup,
  AdminCustomerGroupListResponse
} from '@medusajs/types';
import {
  Container,
  Divider,
  Heading,
  createDataTableColumnHelper,
  toast,
  usePrompt
} from '@medusajs/ui';

import { DataTable } from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table';
import { sdk } from '../../../../../../../../node_modules/@medusajs/dashboard/src/lib/client';
import { formatDate } from '../../../lib/date';

const PAGE_SIZE = 10;

export const SellerCustomerGroupsSection = ({
  seller_customer_groups,
  refetch
}: {
  seller_customer_groups: AdminCustomerGroupListResponse;
  refetch: () => void;
}) => {
  const { customer_groups, count } = seller_customer_groups as {
    customer_groups: AdminCustomerGroup[];
    count: number;
  };

  const columns = useColumns(refetch);
  // const filters = useCustomerGroupTableFilters();
  return (
    <Container
      className="mt-2 px-0"
      data-testid="seller-customer-groups-section"
    >
      <div
        className="px-8 pb-4"
        data-testid="seller-customer-groups-section-header"
      >
        <Heading data-testid="seller-customer-groups-section-heading">
          Customer Groups
        </Heading>
      </div>
      <Divider />
      <DataTable
        data={customer_groups}
        // filters={filters}
        // table={table}
        getRowId={(row) => row.id}
        columns={columns}
        rowCount={count}
        pageSize={PAGE_SIZE}
        isLoading={false}
        // navigateTo={(row) => `/customer-groups/${row.id}`}
        // orderBy={[
        //   { key: "name", label: "Name" },
        //   { key: "created_at", label: "Created" },
        //   { key: "updated_at", label: "Updated" },
        // ]}
      />
    </Container>
  );
};

const columnHelper = createDataTableColumnHelper<AdminCustomerGroup>();

const useColumns = (refetch: () => void) => {
  const prompt = usePrompt();
  const navigate = useNavigate();
  const { t } = useTranslation('b2c');

  const handleDelete = useCallback(
    async (customer_group: AdminCustomerGroup) => {
      const res = await prompt({
        title: t('general.areYouSure'),
        description: `You are about to delete the customer group ${customer_group.name}. This action cannot be undone.`,
        confirmText: t('actions.delete'),
        cancelText: t('actions.cancel')
      });

      if (!res) {
        return;
      }
      // TODO: should delete from `/vendor/customer-groups/{id}`??
      try {
        await sdk.client.fetch(`/admin/customer-groups/${customer_group.id}`, {
          method: 'DELETE'
        });
        toast.success('Customer group deleted successfully', {
          description: `${customer_group.name} deleted successfully`
        });
        refetch();
      } catch {
        toast.error('Error deleting customer group', {
          description: 'Please try again later'
        });
      }
    },
    []
  );

  return useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => t('fields.name'),
        cell: ({ row }) => {
          return (
            <div className="flex h-full w-full max-w-[250px] items-center gap-x-3 overflow-hidden">
              <span title={row.original.name ?? ''} className="truncate">
                {row.original.name}
              </span>
            </div>
          );
        }
      }),
      columnHelper.accessor('customers', {
        cell: ({ row }) => {
          const customers = row.original.customers?.length || 0;
          const suffix = customers > 1 ? 'customers' : 'customer';

          return `${customers} ${suffix}`;
        }
      }),
      columnHelper.accessor('created_at', {
        cell: ({ row }) => formatDate(row.original.created_at, 'MMM d, yyyy')
      }),
      columnHelper.accessor('updated_at', {
        cell: ({ row }) => formatDate(row.original.updated_at, 'MMM d, yyyy')
      }),
      columnHelper.action({
        actions: (ctx) => [
          {
            icon: <PencilSquare />,
            label: t('actions.edit'),
            onClick: () =>
              navigate(`/customer-groups/${ctx.row.original.id}/edit`)
          },
          {
            label: t('actions.delete'),
            onClick: () => handleDelete(ctx.row.original),
            icon: <Trash />
          }
        ]
      })
    ],
    [t]
  );
};
