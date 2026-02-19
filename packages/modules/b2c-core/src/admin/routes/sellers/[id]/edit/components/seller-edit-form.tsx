import { zodResolver } from '@hookform/resolvers/zod';
import { z } from '@medusajs/framework/zod';
import { Button, Heading, Input, Textarea, toast } from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form } from '../../../../../../../../../../node_modules/@medusajs/dashboard/src/components/common/form';
import {
  RouteDrawer,
  useRouteModal
} from '../../../../../../../../../../node_modules/@medusajs/dashboard/src/components/modals';
import { KeyboundForm } from '../../../../../../../../../../node_modules/@medusajs/dashboard/src/components/utilities/keybound-form';
import { useUpdateSeller } from '../../../../../hooks/api/sellers';
import { VendorSeller } from '../../../../../types/seller';

type SellerEditFormProps = {
  seller: VendorSeller;
};

const SellerEditSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  description: z.string().optional(),
  address_line: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country_code: z.string().optional(),
  postal_code: z.string().optional(),
  tax_id: z.string().optional()
});

export const SellerEditForm = ({ seller }: SellerEditFormProps) => {
  const { t } = useTranslation('b2c');
  const { handleSuccess } = useRouteModal();

  const form = useForm<z.infer<typeof SellerEditSchema>>({
    defaultValues: {
      name: seller?.name,
      email: seller?.email || '',
      phone: seller?.phone || undefined,
      description: seller?.description || undefined,
      address_line: seller?.address_line || undefined,
      city: seller?.city || undefined,
      state: seller?.state ?? undefined,
      country_code: seller?.country_code || undefined,
      postal_code: seller?.postal_code || undefined,
      tax_id: seller?.tax_id || undefined
    },
    resolver: zodResolver(SellerEditSchema)
  });

  const { mutateAsync, isPending } = useUpdateSeller();

  const handleSubmit = form.handleSubmit(async (data) => {
    await mutateAsync(
      { id: seller.id, data },
      {
        onSuccess: () => {
          toast.success(
            t('seller.edit.successToast', { name: data.name ?? data.email })
          );
          handleSuccess(`/sellers/${seller.id}`);
        },
        onError: (error) => {
          toast.error(error.message);
        }
      }
    );
  });

  return (
    <RouteDrawer.Form form={form} data-testid="seller-edit-form">
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
        data-testid="seller-edit-form-keybound"
      >
        <RouteDrawer.Body
          className="overflow-y-auto"
          data-testid="seller-edit-form-body"
        >
          <div
            className="flex flex-col gap-y-4"
            data-testid="seller-edit-form-fields"
          >
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <Form.Item data-testid="seller-edit-form-name-item">
                    <Form.Label data-testid="seller-edit-form-name-label">
                      {t('fields.name')}
                    </Form.Label>

                    <Form.Control data-testid="seller-edit-form-name-control">
                      <Input
                        placeholder={t('fields.name')}
                        {...field}
                        data-testid="seller-edit-form-name-input"
                      />
                    </Form.Control>

                    <Form.ErrorMessage data-testid="seller-edit-form-name-error" />
                  </Form.Item>
                );
              }}
            />

            <Form.Field
              control={form.control}
              name="email"
              render={({ field }) => {
                return (
                  <Form.Item data-testid="seller-edit-form-email-item">
                    <Form.Label data-testid="seller-edit-form-email-label">
                      {t('fields.email')}
                    </Form.Label>

                    <Form.Control data-testid="seller-edit-form-email-control">
                      <Input
                        placeholder={t('fields.email')}
                        {...field}
                        data-testid="seller-edit-form-email-input"
                      />
                    </Form.Control>

                    <Form.ErrorMessage data-testid="seller-edit-form-email-error" />
                  </Form.Item>
                );
              }}
            />

            <Form.Field
              control={form.control}
              name="phone"
              render={({ field }) => {
                return (
                  <Form.Item data-testid="seller-edit-form-phone-item">
                    <Form.Label
                      optional
                      data-testid="seller-edit-form-phone-label"
                    >
                      {t('fields.phone')}
                    </Form.Label>

                    <Form.Control data-testid="seller-edit-form-phone-control">
                      <Input
                        placeholder={t('fields.phone')}
                        {...field}
                        data-testid="seller-edit-form-phone-input"
                      />
                    </Form.Control>

                    <Form.ErrorMessage data-testid="seller-edit-form-phone-error" />
                  </Form.Item>
                );
              }}
            />

            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => {
                return (
                  <Form.Item data-testid="seller-edit-form-description-item">
                    <Form.Label
                      optional
                      data-testid="seller-edit-form-description-label"
                    >
                      {t('fields.description')}
                    </Form.Label>

                    <Form.Control data-testid="seller-edit-form-description-control">
                      <Textarea
                        placeholder={t('fields.description')}
                        {...field}
                        data-testid="seller-edit-form-description-input"
                      />
                    </Form.Control>

                    <Form.ErrorMessage data-testid="seller-edit-form-description-error" />
                  </Form.Item>
                );
              }}
            />

            <div
              className="mt-4"
              data-testid="seller-edit-form-address-section"
            >
              <Heading
                level="h3"
                className="mb-4"
                data-testid="seller-edit-form-address-heading"
              >
                {t('fields.address')}
              </Heading>

              <div
                className="flex flex-col gap-y-4"
                data-testid="seller-edit-form-address-fields"
              >
                <Form.Field
                  control={form.control}
                  name="address_line"
                  render={({ field }) => {
                    return (
                      <Form.Item data-testid="seller-edit-form-address-line-item">
                        <Form.Label
                          optional
                          data-testid="seller-edit-form-address-line-label"
                        >
                          {t('seller.fields.addressLine')}
                        </Form.Label>

                        <Form.Control data-testid="seller-edit-form-address-line-control">
                          <Input
                            placeholder={t('seller.fields.addressLine')}
                            {...field}
                            data-testid="seller-edit-form-address-line-input"
                          />
                        </Form.Control>

                        <Form.ErrorMessage data-testid="seller-edit-form-address-line-error" />
                      </Form.Item>
                    );
                  }}
                />

                <Form.Field
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => {
                    return (
                      <Form.Item data-testid="seller-edit-form-postal-code-item">
                        <Form.Label
                          optional
                          data-testid="seller-edit-form-postal-code-label"
                        >
                          {t('fields.postalCode')}
                        </Form.Label>

                        <Form.Control data-testid="seller-edit-form-postal-code-control">
                          <Input
                            placeholder={t('fields.postalCode')}
                            {...field}
                            data-testid="seller-edit-form-postal-code-input"
                          />
                        </Form.Control>

                        <Form.ErrorMessage data-testid="seller-edit-form-postal-code-error" />
                      </Form.Item>
                    );
                  }}
                />

                <Form.Field
                  control={form.control}
                  name="city"
                  render={({ field }) => {
                    return (
                      <Form.Item data-testid="seller-edit-form-city-item">
                        <Form.Label
                          optional
                          data-testid="seller-edit-form-city-label"
                        >
                          {t('fields.city')}
                        </Form.Label>

                        <Form.Control data-testid="seller-edit-form-city-control">
                          <Input
                            placeholder={t('fields.city')}
                            {...field}
                            data-testid="seller-edit-form-city-input"
                          />
                        </Form.Control>

                        <Form.ErrorMessage data-testid="seller-edit-form-city-error" />
                      </Form.Item>
                    );
                  }}
                />

                <Form.Field
                  control={form.control}
                  name="country_code"
                  render={({ field }) => {
                    return (
                      <Form.Item data-testid="seller-edit-form-country-code-item">
                        <Form.Label
                          optional
                          data-testid="seller-edit-form-country-code-label"
                        >
                          {t('fields.country')}
                        </Form.Label>

                        <Form.Control data-testid="seller-edit-form-country-code-control">
                          <Input
                            placeholder={t('fields.country')}
                            {...field}
                            data-testid="seller-edit-form-country-code-input"
                          />
                        </Form.Control>

                        <Form.ErrorMessage data-testid="seller-edit-form-country-code-error" />
                      </Form.Item>
                    );
                  }}
                />

                <Form.Field
                  control={form.control}
                  name="tax_id"
                  render={({ field }) => {
                    return (
                      <Form.Item data-testid="seller-edit-form-tax-id-item">
                        <Form.Label
                          optional
                          data-testid="seller-edit-form-tax-id-label"
                        >
                          TaxID
                        </Form.Label>

                        <Form.Control data-testid="seller-edit-form-tax-id-control">
                          <Input
                            placeholder="TaxID"
                            {...field}
                            data-testid="seller-edit-form-tax-id-input"
                          />
                        </Form.Control>

                        <Form.ErrorMessage data-testid="seller-edit-form-tax-id-error" />
                      </Form.Item>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </RouteDrawer.Body>

        <RouteDrawer.Footer data-testid="seller-edit-form-footer">
          <div
            className="flex items-center justify-end gap-x-2"
            data-testid="seller-edit-form-footer-actions"
          >
            <RouteDrawer.Close asChild>
              <Button
                variant="secondary"
                size="small"
                data-testid="seller-edit-form-cancel-button"
              >
                {t('actions.cancel')}
              </Button>
            </RouteDrawer.Close>

            <Button
              isLoading={isPending}
              type="submit"
              variant="primary"
              size="small"
              data-testid="seller-edit-form-submit-button"
            >
              {t('actions.save')}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  );
};
