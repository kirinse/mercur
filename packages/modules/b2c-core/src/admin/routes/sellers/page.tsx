import { keepPreviousData } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { defineRouteConfig } from '@medusajs/admin-sdk';
import { BuildingStorefront, PencilSquare, User } from '@medusajs/icons';
import {
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Text,
  createDataTableColumnHelper,
  toast,
  usePrompt
} from '@medusajs/ui';

import { DataTable } from '../../../../../../../node_modules/@medusajs/dashboard/src/components/data-table';
import {
  useInviteSeller,
  useSellers,
  useUpdateSeller
} from '../../hooks/api/sellers';
import { useSellersTableColumns } from '../../hooks/table/columns/use-seller-table-columns';
import { useSellersTableQuery } from '../../hooks/table/query/use-sellers-table-query';
import { validateEmail } from '../../lib/validate-email';
import { VendorSeller } from '../../types/seller';

const PAGE_SIZE = 10;

const SellersList = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { searchParams } = useSellersTableQuery({
    pageSize: PAGE_SIZE
  });
  const { t } = useTranslation('b2c');

  const { sellers, count, isLoading, isError, error } = useSellers(
    {
      fields: 'id,email,name,created_at,store_status',
      ...searchParams
    },
    {
      placeholderData: keepPreviousData
    }
  );

  if (isError) {
    throw error;
  }

  const { mutateAsync: inviteSeller } = useInviteSeller();

  const columns = useColumns();

  const handleInvite = async () => {
    try {
      const isValid = validateEmail(email);
      if (!isValid) {
        return;
      }

      await inviteSeller({ email });
      toast.success('Invited!');
      setOpen(false);
      setEmail('');
    } catch {
      toast.error('Error!');
    }
  };

  return (
    <Container data-testid="seller-list-container">
      <div className="flex size-full flex-col overflow-hidden">
        <DataTable
          data={sellers}
          columns={columns}
          getRowId={(row) => row.id}
          rowCount={count}
          rowHref={({ id }) => `/sellers/${id}`}
          pageSize={PAGE_SIZE}
          isLoading={isLoading}
          actions={[
            {
              label: t('seller.actions.invite.title'),
              onClick: () => setOpen(true)
            }
          ]}
        />
      </div>
      <Drawer
        open={open}
        onOpenChange={(openChanged) => setOpen(openChanged)}
        data-testid="seller-list-invite-drawer"
      >
        <Drawer.Title className="sr-only">
          {t('seller.actions.invite.header')}
        </Drawer.Title>
        <Drawer.Content data-testid="seller-list-invite-drawer-content">
          <Drawer.Header data-testid="seller-list-invite-drawer-header" />
          <Drawer.Body data-testid="seller-list-invite-drawer-body">
            <Heading data-testid="seller-list-invite-drawer-title">
              {t('seller.actions.invite.header')}
            </Heading>
            <Text
              className="text-ui-fg-subtle"
              size="small"
              data-testid="seller-list-invite-drawer-description"
            >
              {t('seller.actions.invite.description')}
            </Text>
            <div
              className="mt-6 flex flex-col gap-2"
              data-testid="seller-list-invite-drawer-email-field"
            >
              <Label data-testid="seller-list-invite-drawer-email-label">
                {t('fields.email')}
              </Label>
              <Input
                placeholder={t('fields.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="seller-list-invite-drawer-email-input"
              />
            </div>
            <div
              className="flex justify-end"
              data-testid="seller-list-invite-drawer-footer"
            >
              <Button
                className="mt-6"
                onClick={handleInvite}
                data-testid="seller-list-invite-drawer-submit-button"
              >
                {t('seller.actions.invite.title')}
              </Button>
            </div>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

const columnHelper = createDataTableColumnHelper<VendorSeller>();

const useColumns = () => {
  const { t } = useTranslation('b2c');
  const dialog = usePrompt();
  const navigate = useNavigate();
  const { mutateAsync: suspendSeller } = useUpdateSeller();

  const handleSuspend = useCallback(
    async (seller: VendorSeller) => {
      const res = await dialog({
        title:
          seller.store_status === 'SUSPENDED'
            ? t('seller.actions.activate.title')
            : t('seller.actions.suspend.title'),
        description:
          seller.store_status === 'SUSPENDED'
            ? t('seller.actions.activate.description')
            : t('seller.actions.suspend.description'),
        verificationText: seller.email || seller.name || '',
        verificationInstruction: `${t('general.typeToConfirm1')} {val} ${t('general.typeToConfirm2')}`,
        confirmText: t('actions.confirm'),
        cancelText: t('actions.cancel')
      });

      if (!res) {
        return;
      }

      if (seller.store_status === 'SUSPENDED') {
        await suspendSeller({
          id: seller.id,
          data: { store_status: 'ACTIVE' }
        });
      } else {
        await suspendSeller({
          id: seller.id,
          data: { store_status: 'SUSPENDED' }
        });
      }
    },
    [t, prompt, suspendSeller]
  );

  const base = useSellersTableColumns();

  return useMemo(
    () => [
      ...base,
      columnHelper.action({
        actions: (ctx) => [
          {
            icon: <PencilSquare />,
            label: t('actions.edit'),
            onClick: () => navigate(`/sellers/${ctx.row.original.id}/edit`)
          },
          {
            label:
              ctx.row.original.store_status === 'SUSPENDED'
                ? t('seller.actions.activate.title')
                : t('seller.actions.suspend.title'),
            onClick: () => handleSuspend(ctx.row.original),
            icon: <User />
          }
        ]
      })
    ],
    [base, handleSuspend, t]
  );
};

export const config = defineRouteConfig({
  label: 'seller.domain',
  translationNs: 'b2c',
  icon: BuildingStorefront
});

export const handle = {
  breadcrumb: () => {
    const { t } = useTranslation('b2c');
    return t('seller.domain');
  }
};
export default SellersList;
