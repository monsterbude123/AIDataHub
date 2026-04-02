# =============================================================================
# Integration Service Dockerfile
# =============================================================================

FROM ai-datahub-base:latest AS runner

LABEL service="integration-service"
LABEL description="AI DataHub Integration Service - external connectors"
LABEL version="0.1.0"

EXPOSE 3002

ENV SERVICE_NAME=integration-service
ENV PORT=3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

CMD ["node", "services/integration-service/dist/main.js"]