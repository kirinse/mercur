import { zodResolver } from '@hookform/resolvers/zod';
import { z } from '@medusajs/framework/zod';
import { Button, Input, toast } from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form } from '../../../../../../../../../node_modules/@medusajs/dashboard/src/components/common/form';
import {
    RouteDrawer,
    useRouteModal
} from '../../../../../../../../../node_modules/@medusajs/dashboard/src/components/modals';
import { KeyboundForm } from '../../../../../../../../../node_modules/@medusajs/dashboard/src/components/utilities/keybound-form';
import { useInviteSeller } from '../../../../hooks/api/sellers';

const SellerInviteSchema = z.object({
    email: z.string().email(),
});

export const SellerInviteForm = () => {
    const { t } = useTranslation('b2c');
    const { handleSuccess } = useRouteModal();

    const form = useForm<z.infer<typeof SellerInviteSchema>>({
        defaultValues: {
            email: '',
        },
        resolver: zodResolver(SellerInviteSchema)
    });

    const { mutateAsync, isPending } = useInviteSeller();

    const handleSubmit = form.handleSubmit(async (data) => {
        await mutateAsync(
            data,
            {
                onSuccess: () => {
                    toast.success(
                        t('seller.actions.invite.success')
                    );
                    handleSuccess(`/sellers`);
                },
                onError: (error) => {
                    toast.error(error.message);
                }
            }
        );
    });

    return (
        <RouteDrawer.Form form={form} data-testid="seller-invite-form">
            <KeyboundForm
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col overflow-hidden"
                data-testid="seller-invite-form-keybound"
            >
                <RouteDrawer.Body
                    className="overflow-y-auto"
                    data-testid="seller-invite-form-body"
                >
                    <Form.Field
                        control={form.control}
                        name="email"
                        render={({ field }) => {
                            return (
                                <Form.Item data-testid="seller-invite-form-email-item">
                                    <Form.Label data-testid="seller-invite-form-email-label">
                                        {t('fields.email')}
                                    </Form.Label>

                                    <Form.Control data-testid="seller-invite-form-email-control">
                                        <Input
                                            placeholder={t('fields.email')}
                                            {...field}
                                            data-testid="seller-invite-form-email-input"
                                        />
                                    </Form.Control>

                                    <Form.ErrorMessage data-testid="seller-invite-form-email-error" />
                                </Form.Item>
                            );
                        }}
                    />
                </RouteDrawer.Body>
                <RouteDrawer.Footer data-testid="seller-invite-form-footer">
                    <div
                        className="flex items-center justify-end gap-x-2"
                        data-testid="seller-invite-form-footer-actions"
                    >
                        <RouteDrawer.Close asChild>
                            <Button
                                variant="secondary"
                                data-testid="seller-invite-form-cancel-button"
                            >
                                {t('actions.cancel')}
                            </Button>
                        </RouteDrawer.Close>

                        <Button
                            isLoading={isPending}
                            type="submit"
                            variant="primary"
                            data-testid="seller-invite-form-submit-button"
                        >
                            {t('actions.save')}
                        </Button>
                    </div>
                </RouteDrawer.Footer>
            </KeyboundForm>
        </RouteDrawer.Form>
    );
};
