export const SellerModuleSellerLinkable = {
  toJSON: () => ({
    serviceName: 'seller',
    field: 'seller',
    linkable: 'seller_id',
    primaryKey: 'id'
  }),
  id: {
    serviceName: 'seller',
    field: 'seller',
    linkable: 'seller_id',
    primaryKey: 'id',
    entity: 'Seller'
  }
};
