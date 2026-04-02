# =============================================================================
# Ops Service Dockerfile
# =============================================================================

FROM ai-datahub-base:latest AS runner

LABEL service="ops-service"
LABEL description="AI DataHub Operations Service - monitoring and scheduling"
LABEL version="0.1.0"

EXPOSE 3001

ENV SERVICE_NAME=ops-service
ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "services/ops-service/dist/main.js"]