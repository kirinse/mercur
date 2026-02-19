import { PencilSquare, Trash } from '@medusajs/icons';
import type {
  AdminCustomerGroup
} from '@medusajs/types';
import {
  Container,
  createDataTableColumnHelper,
  toast,
  usePrompt
} from '@medusajs/ui';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table';
import { useDataTableDateColumns } from "../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table/helpers/general/use-data-table-date-columns";
import { useDataTableDateFilters } from "../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table/helpers/general/use-data-table-date-filters";
import { sdk } from '../../../../../../../../node_modules/@medusajs/dashboard/src/lib/client';
import { useSellerCustomerGroups } from '../../../hooks/api/sellers';
import { useCustomerGroupTableQuery } from '../../../hooks/table/query';

const PAGE_SIZE = 10;
const PREFIX = 'scg';

export const SellerCustomerGroupsSection = ({
  id,
}: {
  id: string,
}) => {
  const { t } = useTranslation('b2c');
  const { searchParams } = useCustomerGroupTableQuery(
    {
      pageSize: PAGE_SIZE,
      prefix: PREFIX
    }
  );

  const {
    data,
    isLoading,
    refetch
  } = useSellerCustomerGroups(
    id!,
    {
      fields: 'id,name,description,created_at,updated_at,*customers',
      ...searchParams
    },
  );
  const columns = useColumns(refetch);
  const filters = useFilters();

  return (
    <Container
      className="mt-2 px-0"
      data-testid="seller-customer-groups-section"
    >
      <DataTable
        data={data?.customer_groups}
        filters={filters}
        getRowId={(row) => row.id}
        columns={columns}
        rowCount={data?.count}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        heading={t('customerGroups.domain')}
        rowHref={(row) => `/customer-groups/${row.id}`}
        emptyState={{
          empty: {
            heading: t("customerGroups.list.empty.heading"),
            description: t("customerGroups.list.empty.description"),
          },
          filtered: {
            heading: t("customerGroups.list.filtered.heading"),
            description: t("customerGroups.list.filtered.description"),
          },
        }}
        enableFilterMenu={false}
        prefix={PREFIX}
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
  const dateColumns = useDataTableDateColumns<AdminCustomerGroup>()

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
      ...dateColumns,
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
    [t, handleDelete, dateColumns]
  );
};

const useFilters = () => {
  const dateFilters = useDataTableDateFilters()

  return useMemo(() => {
    return dateFilters
  }, [dateFilters])
}