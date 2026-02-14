import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

import { Spinner } from '@medusajs/icons';

import { RouteDrawer } from '../../../../../../../../../node_modules/@medusajs/dashboard/src/components/modals';
import { sdk } from '../../../../../../../../../node_modules/@medusajs/dashboard/src/lib/client';
import { VendorSeller } from '../../../../types/seller';
import SellerDetails from '../page';
import { SellerEditForm } from './components/seller-edit-form';

const SellerEdit = () => {
  const { t } = useTranslation('b2c');
  const { seller: data } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="text-ui-fg-interactive animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SellerDetails />
      <RouteDrawer>
        <RouteDrawer.Header>
          <RouteDrawer.Title>{t('seller.edit.header')}</RouteDrawer.Title>
        </RouteDrawer.Header>
        {data && <SellerEditForm seller={data} />}
      </RouteDrawer>
    </>
  );
};

export default SellerEdit;

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const { seller } = await sdk.client.fetch<{ seller: VendorSeller }>(
    `/admin/sellers/${id}`,
    {
      method: 'GET',
      query: {
        fields:
          'id,email,name,created_at,store_status,description,handle,phone,address_line,city,country_code,postal_code,tax_id'
      }
    }
  );

  return {
    seller
  };
}

export const handle = {
  breadcrumb: null
};
