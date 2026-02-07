import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

import { TypesenseEvents, TypesenseIndexType } from '@mercurjs/framework';

import { TYPESENSE_MODULE, TypesenseModuleService } from '../modules/typesense';
import {
  filterProductsByStatus,
  findAndTransformAlgoliaProducts
} from './utils';

export default async function typesenseProductsChangedHandler({
  event,
  container
}: SubscriberArgs<{ ids: string[] }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  try {
    const typesense =
      container.resolve<TypesenseModuleService>(TYPESENSE_MODULE);

    const { published, other } = await filterProductsByStatus(
      container,
      event.data.ids
    );

    logger.debug(
      `Typesense sync: Processing ${event.data.ids.length} products - ${published.length} to upsert, ${other.length} to delete`
    );

    const productsToInsert = published.length
      ? await findAndTransformAlgoliaProducts(container, published)
      : [];

    await typesense.batch(TypesenseIndexType.PRODUCT, productsToInsert, other);

    logger.debug(
      `Typesense sync: Successfully synced ${productsToInsert.length} products`
    );
  } catch (error) {
    logger.error(
      `Typesense sync failed for products ${event.data.ids.join(', ')}:`,
      error
    );
    throw error;
  }
}

export const config: SubscriberConfig = {
  event: TypesenseEvents.PRODUCTS_CHANGED,
  context: {
    subscriberId: 'typesense-products-changed-handler'
  }
};
