// packages/sdk/src/auth/AuthenticatedHttpClient.ts
import type { HttpClient, HttpClientRequest, Result } from '../http/HttpClient';

/**
 * HTTP client wrapper that automatically injects Bearer token.
 *
 * @example
 * ```typescript
 * const http = new FetchHttpClient('http://localhost:3000');
 * const authedHttp = new AuthenticatedHttpClient(http, 'my-jwt-token');
 *
 * // All requests will include Authorization: Bearer my-jwt-token
 * const result = await authedHttp.request({ path: '/users', method: 'GET' });
 * ```
 */
export class AuthenticatedHttpClient implements HttpClient {
  private token: string | null;

  /**
   * Create an authenticated HTTP client.
   *
   * @param inner - The underlying HTTP client to wrap
   * @param initialToken - Optional initial JWT token
   */
  constructor(
    private readonly inner: HttpClient,
    initialToken?: string
  ) {
    this.token = initialToken ?? null;
  }

  /**
   * Set the authentication token.
   *
   * @param token - JWT token to use for authentication
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get the current authentication token.
   *
   * @returns The current token or null if not set
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear the authentication token.
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Make an authenticated HTTP request.
   *
   * @param req - The HTTP request to make
   * @returns The response data
   * @throws Error if no token is set
   */
  async request<T>(req: HttpClientRequest): Promise<Result<T>> {
    if (!this.token) {
      throw new Error(
        'No authentication token set. Call setToken() first or provide an initial token.'
      );
    }

    return this.inner.request({
      ...req,
      headers: {
        ...req.headers,
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
}
