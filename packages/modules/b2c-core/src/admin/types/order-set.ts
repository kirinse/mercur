import { OrderDTO } from '@medusajs/types';

export type Order = Omit<OrderDTO, ''>;

export interface OrderSet extends OrderDTO {
  orders: Order[];
}
