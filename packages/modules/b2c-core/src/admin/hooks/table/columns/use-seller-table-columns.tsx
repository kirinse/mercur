import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { createDataTableColumnHelper } from '@medusajs/ui';

import {
  DateCell,
  DateHeader
} from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/table/table-cells/common/date-cell';
import { SellerStatusBadge } from '../../../routes/sellers/_components/seller-status-badge';
import { VendorSeller } from '../../../types/seller';

const columnHelper = createDataTableColumnHelper<VendorSeller>();

export const useSellersTableColumns = () => {
  const { t } = useTranslation('b2c');

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
      columnHelper.accessor('created_at', {
        header: () => <DateHeader />,
        cell: ({ row }) => <DateCell date={new Date(row.original.created_at)} />
      })
    ],
    [t, columnHelper]
  );
};
