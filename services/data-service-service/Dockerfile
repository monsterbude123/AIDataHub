# =============================================================================
# Data Service Dockerfile
# =============================================================================

FROM ai-datahub-base:latest AS runner

LABEL service="data-service-service"
LABEL description="AI DataHub Data Service - core business logic"
LABEL version="0.1.0"

EXPOSE 4003

ENV SERVICE_NAME=data-service-service
ENV PORT=4003

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4003/health || exit 1

CMD ["node", "services/data-service-service/dist/main.js"]