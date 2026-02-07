import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';

import { syncTypesenseProductsStep } from '../steps';

export const syncTypesenseWorkflow = createWorkflow(
  'sync-typesense-workflow',
  function () {
    return new WorkflowResponse(syncTypesenseProductsStep());
  }
);
