# =============================================================================
# Metadata Service Dockerfile
# =============================================================================

FROM ai-datahub-base:latest AS runner

LABEL service="metadata-service"
LABEL description="AI DataHub Metadata Service"
LABEL version="0.1.0"

EXPOSE 4002

ENV SERVICE_NAME=metadata-service
ENV PORT=4002

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4002/health || exit 1

CMD ["node", "services/metadata-service/dist/main.js"]