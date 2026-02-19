import { LoaderFunctionArgs } from 'react-router-dom';

import { queryClient } from '../../../../../../../../node_modules/@medusajs/dashboard/src/lib/query-client';
import { sellerQuery } from '../../../hooks/api/sellers';

export async function sellerLoader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const query = sellerQuery(id!);
  return queryClient.fetchQuery(query);
}
