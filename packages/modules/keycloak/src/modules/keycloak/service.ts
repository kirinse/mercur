import jwt, { type JwtPayload } from 'jsonwebtoken';

import {
  AuthIdentityDTO,
  AuthIdentityProviderService,
  AuthenticationInput,
  AuthenticationResponse,
  Logger
} from '@medusajs/framework/types';
import {
  AbstractAuthModuleProvider,
  MedusaError
} from '@medusajs/framework/utils';

type InjectedDependencies = {
  logger: Logger;
};

type Options = {
  clientId: string;
  clientSecret: string;
  realmUrl: string;
  redirectUri: string;
};

export class KeycloakAuthService extends AbstractAuthModuleProvider {
  static identifier = 'keycloak';
  static DISPLAY_NAME = 'Keycloak';

  // Scopes requested from Okta during authentication
  private static readonly SCOPES = ['openid', 'profile', 'email'];

  protected options_: Options;
  protected logger_: Logger;

  constructor({ logger }: InjectedDependencies, options: Options) {
    // @ts-expect-error super
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);
    this.options_ = options;
    this.logger_ = logger;
  }

  static validateOptions(options: Options) {
    if (!options.clientId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Keycloak clientId is required'
      );
    }

    if (!options.clientSecret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Keycloak clientSecret is required'
      );
    }

    if (!options.realmUrl) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Keycloak realmUrl is required'
      );
    }

    if (!options.redirectUri) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Keycloak redirectUri is required'
      );
    }
  }

  async authenticate(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const { body } = data;
    // If callback_url is provided, use it; otherwise use the default redirectUri
    const callbackUrl = body?.callback_url || this.options_.redirectUri;

    // Generate state parameter for CSRF protection
    const state = this.generateState();

    await authIdentityProviderService.setState(state, {
      callback_url: callbackUrl
    });

    const params = new URLSearchParams({
      client_id: this.options_.clientId,
      response_type: 'code',
      scope: KeycloakAuthService.SCOPES.join(' '),
      redirect_uri: callbackUrl,
      state
    });

    const authUrl = `${this.options_.realmUrl}/protocol/openid-connect/auth?${params.toString()}`;

    return {
      success: true,
      location: authUrl
    };
  }

  async validateCallback(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const { query } = data;

    const code = query?.code as string;
    if (!code) {
      return { success: false, error: 'No code provided' };
    }

    const stateKey = query?.state as string;

    const state = await authIdentityProviderService.getState(stateKey);
    if (!state) {
      return {
        success: false,
        error: 'No state provided, or session expired'
      };
    }

    try {
      // Exchange code for tokens
      const tokenUrl = `${this.options_.realmUrl}/protocol/openid-connect/token`;
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.options_.clientId,
        client_secret: this.options_.clientSecret,
        code,
        redirect_uri: state.callback_url as string
      });

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!tokenResponse.ok) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Could not exchange token: ${tokenResponse.status} ${tokenResponse.statusText}`
        );
      }

      const tokens = await tokenResponse.json();

      if (!tokens.id_token) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          'No id_token in response'
        );
      }

      // Decode and verify the ID token
      const jwtData = jwt.decode(tokens.id_token, {
        complete: true
      }) as JwtPayload;

      if (!jwtData?.payload) {
        return {
          success: false,
          error: 'Invalid id_token'
        };
      }

      const payload = jwtData.payload;
      const entity_id = payload.email || payload.sub;

      if (!entity_id) {
        return {
          success: false,
          error: 'No subject in token'
        };
      }

      // Try to retrieve existing identity or create new one
      let authIdentity: AuthIdentityDTO;

      try {
        authIdentity = await authIdentityProviderService.retrieve({
          entity_id
        });
        // Update existing auth identity with latest user metadata
        authIdentity = await authIdentityProviderService.update(entity_id, {
          user_metadata: {
            email: payload.email,
            name: payload.name,
            given_name: payload.given_name,
            family_name: payload.family_name,
            picture: payload.picture,
            updated_at: new Date().toISOString()
          },
          provider_metadata: {
            keycloak_sub: payload.sub,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            id_token: tokens.id_token,
            expires_at: Date.now() + tokens.expires_in * 1000
          }
        });
      } catch (e) {
        if (e.type === MedusaError.Types.NOT_FOUND) {
          // Create new auth identity
          authIdentity = await authIdentityProviderService.create({
            entity_id,
            user_metadata: {
              name: payload.name,
              given_name: payload.given_name,
              family_name: payload.family_name,
              email: payload.email,
              picture: payload.picture
            },
            provider_metadata: {
              keycloak_sub: payload.sub,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              id_token: tokens.id_token,
              expires_at: Date.now() + tokens.expires_in * 1000
            }
          });
        } else {
          throw e;
        }
      }

      return {
        success: true,
        authIdentity
      };
    } catch (error) {
      this.logger_.error('Keycloak authentication error:', error);
      return {
        success: false,
        error: error.message || 'Failed to authenticate with Keycloak'
      };
    }
  }

  /**
   * Generate a random state parameter for CSRF protection
   */
  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}

export default KeycloakAuthService;
