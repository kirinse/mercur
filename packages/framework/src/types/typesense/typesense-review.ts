import { z } from '@medusajs/framework/zod';

export type TypesenseReview = z.infer<typeof TypesenseReviewValidator>;
export const TypesenseReviewValidator = z.object({
  id: z.string(),
  reference: z.string(),
  reference_id: z.string(),
  rating: z.coerce.number(),
  customer_note: z.string().nullable(),
  seller_note: z.string().nullable()
});
