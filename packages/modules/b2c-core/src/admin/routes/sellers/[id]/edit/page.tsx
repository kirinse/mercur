import { Spinner } from '@medusajs/icons';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useParams } from "react-router-dom";
import { Fragment } from 'react/jsx-runtime';
import { RouteDrawer } from '../../../../../../../../../node_modules/@medusajs/dashboard/src/components/modals';
import { useSeller } from '../../../../hooks/api/sellers';
import { sellerLoader } from '../loader';
import SellerDetails from '../page';
import { SellerEditForm } from './components/seller-edit-form';

const SellerEdit = () => {
    const { t } = useTranslation('b2c');
    const { id } = useParams();
    const { data, isLoading, isError, error } = useSeller(id!);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center">
                <Spinner className="text-ui-fg-interactive animate-spin" />
            </div>
        );
    }

    if (isError) {
        throw error;
    }

    return (
        <Fragment>
            <SellerDetails />
            <RouteDrawer>
                <RouteDrawer.Header>
                    <RouteDrawer.Title>{t('seller.edit.header')}</RouteDrawer.Title>
                </RouteDrawer.Header>
                {data && <SellerEditForm seller={data?.seller} />}
            </RouteDrawer>
        </Fragment>
    );
};

export default SellerEdit;

export async function loader(args: LoaderFunctionArgs) {
    return sellerLoader(args)
}
