import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import httpProxy from 'http-proxy';
import type { RouteConfig } from './proxy.config';
import { loadRouteConfig } from './proxy.config';
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Proxy service
 *
 * Forwards incoming requests to configured backend services based on path prefix.
 */
@Injectable()
export class ProxyService implements OnModuleInit {
  private readonly logger = new Logger(ProxyService.name);
  private proxy: httpProxy.ProxyServer;
  private routes: RouteConfig[] = [];

  onModuleInit(): void {
    this.proxy = httpProxy.createProxyServer({});
    this.routes = loadRouteConfig();

    // Log configured routes
    this.logger.log(`Loaded ${this.routes.length} proxy routes:`);
    this.routes.forEach((route) => {
      this.logger.log(`  ${route.prefix} → ${route.target}`);
    });

    // Handle proxy errors
    this.proxy.on(
      'error',
      (err: Error, _req: IncomingMessage, res: ServerResponse) => {
        this.logger.error(`Proxy error: ${err.message}`, err);
        if (!res.headersSent) {
          res.writeHead(503, {
            'Content-Type': 'application/json',
          });
        }
        res.end(
          JSON.stringify({
            ok: false,
            error: {
              code: 'PROXY_ERROR',
              message: 'Backend service unavailable',
              level: 'ERROR',
            },
          })
        );
      }
    );
  }

  /**
   * Find matching route for request path
   */
  findRoute(path: string): RouteConfig | undefined {
    return this.routes.find((route) => path.startsWith(route.prefix));
  }

  /**
   * Process and forward request to target backend
   */
  forward(
    req: IncomingMessage,
    res: ServerResponse,
    route: RouteConfig,
    traceId: string
  ): void {
    let targetPath = req.url || '/';

    // Strip prefix if configured
    if (route.stripPrefix) {
      targetPath = targetPath.replace(route.prefix, '');
      if (!targetPath.startsWith('/')) {
        targetPath = '/' + targetPath;
      }
    }

    // Update request URL for proxy
    req.url = targetPath;

    // Add traceId header to downstream service
    const headers = {
      'x-trace-id': traceId,
    };

    this.proxy.web(req, res, {
      target: route.target,
      headers,
    });
  }

  /**
   * Get all configured routes (for listing in docs)
   */
  getRoutes(): RouteConfig[] {
    return [...this.routes];
  }
}
