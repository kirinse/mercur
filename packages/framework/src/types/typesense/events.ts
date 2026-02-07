export enum TypesenseEvents {
  PRODUCTS_CHANGED = 'typesense.products.changed',
  PRODUCTS_DELETED = 'typesense.products.deleted',
  REVIEW_CHANGED = 'typesense.reviews.changed'
}

export enum TypesenseIntermediateEvents {
  FULFULLMENT_SET_CHANGED = 'typesense.intermediate.fulfillment_set.changed',
  SERVICE_ZONE_CHANGED = 'typesense.intermediate.service_zone.changed',
  SHIPPING_OPTION_CHANGED = 'typesense.intermediate.shipping_option.changed',
  STOCK_LOCATION_CHANGED = 'typesense.intermediate.stock_location.changed',
  INVENTORY_ITEM_CHANGED = 'typesense.intermediate.inventory_item.changed'
}
