import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { PencilSquare, User } from '@medusajs/icons';
import { Container, Divider, Heading, Text, usePrompt } from '@medusajs/ui';

import { ActionMenu } from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/common/action-menu/action-menu.tsx';
import { useUpdateSeller } from '../../../hooks/api/sellers';
import { VendorSeller } from '../../../types/seller';
import { SellerStatusBadge } from './seller-status-badge.tsx';

export const SellerGeneralSection = ({ seller }: { seller: VendorSeller }) => {
  const { t } = useTranslation('b2c');
  const navigate = useNavigate();
  const { mutateAsync: suspendSeller } = useUpdateSeller();

  const dialog = usePrompt();

  const handleSuspend = async () => {
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
      await suspendSeller({ id: seller.id, data: { store_status: 'ACTIVE' } });
    } else {
      await suspendSeller({
        id: seller.id,
        data: { store_status: 'SUSPENDED' }
      });
    }
  };

  return (
    <>
      <Container className="mb-2" data-testid="seller-general-section-header">
        <div className="flex items-center justify-between">
          <Heading data-testid="seller-general-section-name">
            {seller.email || seller.name}
          </Heading>
          <div className="flex items-center gap-2">
            <SellerStatusBadge
              status={seller.store_status || 'pending'}
              data-testid="seller-general-section-status-badge"
            />
            <ActionMenu
              variant="primary"
              groups={[
                {
                  actions: [
                    {
                      label: t('actions.edit'),
                      onClick: () => navigate(`/sellers/${seller.id}/edit`),
                      icon: <PencilSquare />
                    },
                    {
                      label:
                        seller.store_status === 'SUSPENDED'
                          ? t('seller.actions.activate.title')
                          : t('seller.actions.suspend.title'),
                      onClick: () => handleSuspend(),
                      icon: <User />
                    }
                  ]
                }
              ]}
            />
          </div>
        </div>
      </Container>
      <div className="flex gap-4">
        <Container className="px-0" data-testid="seller-general-section-store">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <Heading data-testid="seller-general-section-store-heading">
                {t('general.store')}
              </Heading>
            </div>
          </div>
          <div>
            <Divider />
            <div
              className="flex px-8 py-4"
              data-testid="seller-general-section-store-name-row"
            >
              <Text
                className="w-1/2 font-medium text-ui-fg-subtle"
                data-testid="seller-general-section-store-name-label"
              >
                {t('fields.name')}
              </Text>
              <Text
                className="w-1/2"
                data-testid="seller-general-section-store-name-value"
              >
                {seller.name}
              </Text>
            </div>
            <Divider />
            <div
              className="flex px-8 py-4"
              data-testid="seller-general-section-store-email-row"
            >
              <Text
                className="w-1/2 font-medium text-ui-fg-subtle"
                data-testid="seller-general-section-store-email-label"
              >
                {t('fields.email')}
              </Text>
              <Text
                className="w-1/2"
                data-testid="seller-general-section-store-email-value"
              >
                {seller.email}
              </Text>
            </div>
            <Divider />
            <div
              className="flex px-8 py-4"
              data-testid="seller-general-section-store-phone-row"
            >
              <Text
                className="w-1/2 font-medium text-ui-fg-subtle"
                data-testid="seller-general-section-store-phone-label"
              >
                {t('fields.phone')}
              </Text>
              <Text
                className="w-1/2"
                data-testid="seller-general-section-store-phone-value"
              >
                {seller.phone}
              </Text>
            </div>
            <Divider />
            <div
              className="flex px-8 py-4"
              data-testid="seller-general-section-store-description-row"
            >
              <Text
                className="w-1/2 font-medium text-ui-fg-subtle"
                data-testid="seller-general-section-store-description-label"
              >
                {t('fields.description')}
              </Text>
              <Text
                className="w-1/2"
                data-testid="seller-general-section-store-description-value"
              >
                {seller.description}
              </Text>
            </div>
          </div>
        </Container>
        <Container
          className="px-0"
          data-testid="seller-general-section-address"
        >
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <Heading data-testid="seller-general-section-address-heading">
                {t('fields.address')}
              </Heading>
            </div>
          </div>
          <div>
            <Divider />
            <div
              className="flex px-8 py-4"
              data-testid="seller-general-section-address-line-row"
            >
              <Text
                className="w-1/2 font-medium text-ui-fg-subtle"
                data-testid="seller-general-section-address-line-label"
              >
                {t('fields.address')}
              </Text>
              <Text
                className="w-1/2"
                data-testid="seller-general-section-address-line-value"
              >
                {seller.address_line}
              </Text>
            </div>
            <Divider />
            <div
              className="flex px-8 py-4"
              data-testid="seller-general-section-postal-code-row"
            >
              <Text
                className="w-1/2 font-medium text-ui-fg-subtle"
                data-testid="seller-general-section-postal-code-label"
              >
                {t('fields.postalCode')}
              </Text>
              <Text
                className="w-1/2"
                data-testid="seller-general-section-postal-code-value"
              >
                {seller.postal_code}
              </Text>
            </div>
            <Divider />
            <div
              className="flex px-8 py-4"
              data-testid="seller-general-section-city-row"
            >
              <Text
                className="w-1/2 font-medium text-ui-fg-subtle"
                data-testid="seller-general-section-city-label"
              >
                {t('fields.city')}
              </Text>
              <Text
                className="w-1/2"
                data-testid="seller-general-section-city-value"
              >
                {seller.city}
              </Text>
            </div>
            <Divider />
            <div
              className="flex px-8 py-4"
              data-testid="seller-general-section-country-row"
            >
              <Text
                className="w-1/2 font-medium text-ui-fg-subtle"
                data-testid="seller-general-section-country-label"
              >
                {t('fields.country')}
              </Text>
              <Text
                className="w-1/2"
                data-testid="seller-general-section-country-value"
              >
                {seller.country_code}
              </Text>
            </div>
            <Divider />
            <div
              className="flex px-8 py-4"
              data-testid="seller-general-section-tax-id-row"
            >
              <Text
                className="w-1/2 font-medium text-ui-fg-subtle"
                data-testid="seller-general-section-tax-id-label"
              >
                TaxID
              </Text>
              <Text
                className="w-1/2"
                data-testid="seller-general-section-tax-id-value"
              >
                {seller.tax_id}
              </Text>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};
