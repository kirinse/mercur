import { createDataTableColumnHelper } from '@medusajs/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataTableDateColumns } from "../../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table/helpers/general/use-data-table-date-columns";
import { SellerStatusBadge } from '../../../routes/sellers/_components/seller-status-badge';
import { VendorSeller } from '../../../types/seller';

const columnHelper = createDataTableColumnHelper<VendorSeller>();

export const useSellersTableColumns = () => {
  const { t } = useTranslation('b2c');
  const dateColumns = useDataTableDateColumns<VendorSeller>()

  return useMemo(
    () => [
      columnHelper.accessor('email', {
        header: () => t('fields.email')
      }),
      columnHelper.accessor('name', {
        header: () => t('fields.name')
      }),
      columnHelper.accessor('store_status', {
        header: () => t('seller.fields.store_status'),
        cell: ({ row }) => (
          <SellerStatusBadge
            status={row.original.store_status || 'pending'}
            data-testid="seller-general-section-status-badge"
          />
        )
      }),
      ...dateColumns,
    ],
    [t, columnHelper]
  );
};
