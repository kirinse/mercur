import { PencilSquare, Trash } from '@medusajs/icons';
import {
  Container,
  DataTableFilter,
  createDataTableColumnHelper,
  toast,
  usePrompt
} from '@medusajs/ui';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table';
import { useDataTableDateFilters } from "../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table/helpers/general/use-data-table-date-filters";
import {
  CollectionCell,
  CollectionHeader
} from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/table/table-cells/product/collection-cell/collection-cell';
import {
  ProductCell,
  ProductHeader
} from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/table/table-cells/product/product-cell';
import {
  ProductStatusCell,
  ProductStatusHeader
} from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/table/table-cells/product/product-status-cell';
import {
  VariantCell,
  VariantHeader
} from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/table/table-cells/product/variant-cell';
import { useProductTags, useProductTypes, useSalesChannels } from "../../../../../../../../node_modules/@medusajs/dashboard/src/hooks/api";
import { sdk } from '../../../../../../../../node_modules/@medusajs/dashboard/src/lib/client';
import { useSellerProducts } from '../../../hooks/api/sellers';
import { useSellerProductsTableQuery } from '../../../hooks/table/query/use-seller-products-table-query';
import { AdminProduct } from '../../../types/product';

const PAGE_SIZE = 10;
const PREFIX = 'sp';

export const SellerProductsSection = ({
  id,
}: {
  id: string,
}) => {
  const { t } = useTranslation('b2c');
  const { searchParams } = useSellerProductsTableQuery({
    pageSize: PAGE_SIZE,
    offset: 0,
    prefix: PREFIX
  });

  const {
    data,
    isLoading,
    refetch
  } = useSellerProducts(
    id!,
    {
      fields:
        '*collection,+type_id,+tag_id,+sales_channel_id,+status,+created_at,+updated_at',
      ...searchParams
    },
  );

  const filters = useFilters();

  const columns = useColumns(refetch);

  return (
    <Container className="mt-2 px-0" data-testid="seller-products-section">
      <DataTable
        data={data?.products}
        filters={filters}
        getRowId={(row) => row.id}
        columns={columns}
        rowCount={data?.count}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        rowHref={({ id }) => `/products/${id}`}
        heading={t('products.domain')}
        emptyState={{
          empty: {
            heading: t("seller.products.list.empty.heading"),
            description: t("seller.products.list.empty.description"),
          },
          filtered: {
            heading: t("seller.products.list.filtered.heading"),
            description: t("seller.products.list.filtered.description"),
          },
        }}
        enableFilterMenu={false}
        prefix={PREFIX}
      />
    </Container>
  );
};

const columnHelper = createDataTableColumnHelper<AdminProduct>();

const useColumns = (refetch: () => void) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const prompt = usePrompt();

  const handleDelete = useCallback(
    async (product: AdminProduct) => {
      const res = await prompt({
        title: t('general.areYouSure'),
        description: t('products.deleteWarning', {
          title: product.title
        }),
        confirmText: t('actions.delete'),
        cancelText: t('actions.cancel')
      });

      if (!res) {
        return;
      }

      try {
        await sdk.client.fetch(`/admin/products/${product.id}`, {
          method: 'DELETE'
        });
        toast.success(t('products.toasts.delete.success.header'), {
          description: t('products.toasts.delete.success.description', {
            title: product.title
          })
        });
        refetch();
      } catch (e: unknown) {
        toast.error(t('products.toasts.delete.error.header'), {
          description: (e as Error)?.message
        });
      }
    },
    [t]
  );

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'product',
        header: () => <ProductHeader />,
        cell: ({ row }) => <ProductCell product={row.original} />
      }),
      columnHelper.accessor('collection', {
        header: () => <CollectionHeader />,
        cell: ({ row }) => (
          <CollectionCell collection={row.original.collection} />
        )
      }),
      columnHelper.accessor('variants', {
        header: () => <VariantHeader />,
        cell: ({ row }) => <VariantCell variants={row.original.variants} />
      }),
      columnHelper.accessor('status', {
        header: () => <ProductStatusHeader />,
        cell: ({ row }) => <ProductStatusCell status={row.original.status} />
      }),
      columnHelper.action({
        actions: (ctx) => [
          {
            label: t('actions.edit'),
            onClick: () => navigate(`/products/${ctx.row.original.id}/edit`),
            icon: <PencilSquare />
          },
          {
            label: t('actions.delete'),
            onClick: () => handleDelete(ctx.row.original),
            icon: <Trash />
          }
        ]
      })
    ],
    [t, handleDelete]
  );

  return columns;
};


const useFilters = (): DataTableFilter[] => {
  const { t } = useTranslation('b2c');
  const dateFilterOptions = useDataTableDateFilters()

  const { product_types } = useProductTypes(
    {
      limit: 1000,
      offset: 0,
    },
    {
      throwOnError: true
    }
  )

  const { product_tags } = useProductTags(
    {
      limit: 1000,
      offset: 0,
    },
    {
      throwOnError: true
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

  return useMemo(() => {
    return [
      {
        id: "type_id",
        label: t("fields.type"),
        type: "multiselect",
        options: product_types?.map((t) => ({
          label: t.value,
          value: t.id,
        })) || [],
      },
      {
        id: "tag_id",
        label: t("fields.tag"),
        type: "multiselect",
        options: product_tags?.map((t) => ({
          label: t.value,
          value: t.id,
        })) || [],
      },
      {
        id: "sales_channel_id",
        label: t("fields.salesChannel"),
        type: "multiselect",
        options: sales_channels?.map((s) => ({
          label: s.name,
          value: s.id,
        })) || [],
      },
      {
        id: "status",
        label: t("fields.status"),
        type: "multiselect",
        options: [
          {
            label: t("products.productStatus.draft"),
            value: "draft",
          },
          {
            label: t("products.productStatus.proposed"),
            value: "proposed",
          },
          {
            label: t("products.productStatus.published"),
            value: "published",
          },
          {
            label: t("products.productStatus.rejected"),
            value: "rejected",
          },
        ],
      },
      ...dateFilterOptions,
    ] satisfies DataTableFilter[]
  }, [
    sales_channels,
    product_types,
    product_tags,
    dateFilterOptions
  ])
}