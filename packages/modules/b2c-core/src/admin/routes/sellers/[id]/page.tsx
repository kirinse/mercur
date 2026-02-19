import { Fragment } from 'react';
import {
  LoaderFunctionArgs,
  Outlet,
  UIMatch,
  useLoaderData,
  useParams
} from 'react-router-dom';
import { VendorSeller } from '../../../types/seller';
import { SellerCustomerGroupsSection } from '../_components/seller-customer-groups-section';
import { SellerGeneralSection } from '../_components/seller-general-section';
import { SellerOrdersSection } from '../_components/seller-orders-section';
import { SellerProductsSection } from '../_components/seller-products-section';
import { sellerLoader } from './loader';

const SellerDetails = () => {
  const { id } = useParams();
  const { seller: data } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;

  return (
    <Fragment>
      <SellerGeneralSection seller={data} />
      <SellerOrdersSection id={id!} />
      <SellerProductsSection
        id={id!}
      />
      <SellerCustomerGroupsSection
        id={id!}
      />
      <Outlet />
    </Fragment>
  );
};

export default SellerDetails;

export const handle = {
  breadcrumb: ({
    data
  }: UIMatch<{
    seller: VendorSeller;
  }>) => data.seller.name || data.seller.email || 'Seller'
};

export async function loader(args: LoaderFunctionArgs) {
  return sellerLoader(args)
}