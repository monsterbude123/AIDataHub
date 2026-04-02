/**
 * Proxy route configuration
 *
 * Maps gateway path prefixes to backend service URLs.
 * Configuration is loaded from environment variables.
 */

export interface RouteConfig {
  /** Path prefix that matches incoming request */
  prefix: string;
  /** Target backend URL */
  target: string;
  /** Whether to strip the prefix when forwarding */
  stripPrefix: boolean;
}

/**
 * Load route configuration from environment variables.
 *
 * Expected format:
 * AUTH_SERVICE_URL=http://localhost:3000
 * METADATA_SERVICE_URL=http://localhost:3001
 * DATA_SERVICE_URL=http://localhost:3002
 * TASK_SERVICE_URL=http://localhost:3003
 */
export function loadRouteConfig(): RouteConfig[] {
  const routes: RouteConfig[] = [];

  // Auth service - /api/auth/* -> backend/*
  if (process.env.AUTH_SERVICE_URL) {
    routes.push({
      prefix: '/api/auth',
      target: process.env.AUTH_SERVICE_URL,
      stripPrefix: true,
    });
  }

  // Metadata service - /api/metadata/* -> backend/*
  if (process.env.METADATA_SERVICE_URL) {
    routes.push({
      prefix: '/api/metadata',
      target: process.env.METADATA_SERVICE_URL,
      stripPrefix: true,
    });
  }

  // Data service - /api/data/* -> backend/*
  if (process.env.DATA_SERVICE_URL) {
    routes.push({
      prefix: '/api/data',
      target: process.env.DATA_SERVICE_URL,
      stripPrefix: true,
    });
  }

  // Task scheduler service - /api/tasks/* -> backend/*
  if (process.env.TASK_SERVICE_URL) {
    routes.push({
      prefix: '/api/tasks',
      target: process.env.TASK_SERVICE_URL,
      stripPrefix: true,
    });
  }

  return routes;
}
