import { defineRouteConfig } from '@medusajs/admin-sdk';
import { BuildingStorefront } from '@medusajs/icons';
import { Fragment } from 'react';
import { Trans } from 'react-i18next';
import { Outlet } from "react-router-dom";
import { SellerListTable } from './_components/seller-list-table';

const SellersList = () => {
    return (
        <Fragment>
            <SellerListTable />
            <Outlet />
        </Fragment>
    );
};

export const config = defineRouteConfig({
    label: 'seller.domain',
    translationNs: 'b2c',
    icon: BuildingStorefront
});

export const handle = {
    breadcrumb: () => {
        return <Trans
            ns='b2c'
            i18nKey={`seller.domain`}
        />;
    }
};
export default SellersList;
