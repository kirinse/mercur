import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

import { TypesenseEvents, TypesenseIndexType } from '@mercurjs/framework';

import { TYPESENSE_MODULE, TypesenseModuleService } from '../modules/typesense';

export default async function algoliaProductsDeletedHandler({
  event,
  container
}: SubscriberArgs<{ ids: string[] }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  try {
    const algolia = container.resolve<TypesenseModuleService>(TYPESENSE_MODULE);

    logger.debug(
      `Typesense sync: Deleting ${event.data.ids.length} products from index`
    );

    await algolia.batchDelete(TypesenseIndexType.PRODUCT, event.data.ids);

    logger.debug(
      `Typesense sync: Successfully deleted products ${event.data.ids.join(', ')}`
    );
  } catch (error) {
    logger.error(
      `Typesense delete failed for products ${event.data.ids.join(', ')}:`,
      error
    );
    throw error;
  }
}

export const config: SubscriberConfig = {
  event: TypesenseEvents.PRODUCTS_DELETED,
  context: {
    subscriberId: 'typesense-products-deleted-handler'
  }
};
