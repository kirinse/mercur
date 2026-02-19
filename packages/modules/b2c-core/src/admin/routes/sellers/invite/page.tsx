import { useTranslation } from 'react-i18next';
import { RouteDrawer } from '../../../../../../../../node_modules/@medusajs/dashboard/src/components/modals';
import { SellerInviteForm } from './components/invite-form';

const SellerInvitePage = () => {
    const { t } = useTranslation('b2c')
    return (
        <RouteDrawer prev='/sellers'>
            <RouteDrawer.Header>
                <RouteDrawer.Title>{t('seller.actions.invite.header')}</RouteDrawer.Title>
                <RouteDrawer.Description>{t('seller.actions.invite.description')}</RouteDrawer.Description>
            </RouteDrawer.Header>
            <SellerInviteForm />
        </RouteDrawer>
    )
};

export default SellerInvitePage;