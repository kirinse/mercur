import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { PencilSquare, Trash } from '@medusajs/icons';
import {
  Container,
  Divider,
  Heading,
  createDataTableColumnHelper,
  toast,
  usePrompt
} from '@medusajs/ui';

import { DataTable } from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table';
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
import { useProductTableFilters } from '../../../../../../../../node_modules/@medusajs/dashboard/src/hooks/table/filters';
import { sdk } from '../../../../../../../../node_modules/@medusajs/dashboard/src/lib/client';
import { AdminProduct, AdminProductListResponse } from '../../../types/product';

const PAGE_SIZE = 10;
const PREFIX = 'sp';

export const SellerProductsSection = ({
  seller_products,
  refetch
}: {
  seller_products: AdminProductListResponse;
  refetch: () => void;
}) => {
  const { products, count } = seller_products;

  const columns = useColumns(refetch);
  const filters = useProductTableFilters();

  return (
    <Container className="mt-2 px-0" data-testid="seller-products-section">
      <div className="px-8 pb-4" data-testid="seller-products-section-header">
        <Heading data-testid="seller-products-section-heading">
          Products
        </Heading>
      </div>
      <Divider />
      <DataTable
        data={products}
        // @ts-expect-error mismatch type
        filters={filters}
        getRowId={(row) => row.id}
        columns={columns}
        rowCount={count}
        pageSize={PAGE_SIZE}
        isLoading={false}
        // navigateTo={(row) => `/products/${row.id}`}
        // orderBy={[
        //   { key: "title", label: "Title" },
        //   { key: "created_at", label: "Created" },
        //   { key: "updated_at", label: "Updated" },
        // ]}
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
