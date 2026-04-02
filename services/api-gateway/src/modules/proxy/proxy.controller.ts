import {
  Controller,
  All,
  Req,
  Res,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Public } from '@ai-datahub/shared';
import type { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    traceId?: string;
  }
}

/**
 * Proxy controller
 *
 * Catches all unmatched routes and proxies them to the appropriate backend service
 * based on the path prefix.
 */
@Controller()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @All('*')
  proxy(@Req() req: FastifyRequest, @Res() reply: FastifyReply): void {
    const path = req.url || '/';
    const traceId = req.traceId || 'unknown';

    const route = this.proxyService.findRoute(path);

    if (!route) {
      this.logger.warn(`No route found for path: ${path}`);
      throw new NotFoundException(`Route not found: ${path}`);
    }

    // Get the raw Node.js request/response for http-proxy
    const rawReq = req.raw;
    const rawRes = reply.raw;

    this.proxyService.forward(rawReq, rawRes, route, traceId);
  }
}
