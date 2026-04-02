# =============================================================================
# Sharing Service Dockerfile
# =============================================================================

FROM ai-datahub-base:latest AS runner

LABEL service="sharing-service"
LABEL description="AI DataHub Sharing Service - data exchange portal"
LABEL version="0.1.0"

EXPOSE 3004

ENV SERVICE_NAME=sharing-service
ENV PORT=3004

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3004/health || exit 1

CMD ["node", "services/sharing-service/dist/main.js"]