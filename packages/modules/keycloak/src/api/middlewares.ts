import {
  authenticate,
  defineMiddlewares,
  validateAndTransformBody
} from '@medusajs/framework/http';

import { CreateUserSchema } from './keycloak/users/route';
import validateKeycloakProvider from './middlewares/validate-keycloak-provider';

export default defineMiddlewares({
  routes: [
    {
      matcher: '/keycloak/users',
      methods: ['POST'],
      middlewares: [
        authenticate('user', 'bearer', {
          allowUnregistered: true
        }),
        validateAndTransformBody(CreateUserSchema),
        validateKeycloakProvider
      ]
    }
  ]
});
