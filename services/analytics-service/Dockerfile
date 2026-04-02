# =============================================================================
# Analytics Service Dockerfile
# =============================================================================

FROM ai-datahub-base:latest AS runner

LABEL service="analytics-service"
LABEL description="AI DataHub Analytics Service - self-service analytics"
LABEL version="0.1.0"

EXPOSE 3005

ENV SERVICE_NAME=analytics-service
ENV PORT=3005

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3005/health || exit 1

CMD ["node", "services/analytics-service/dist/main.js"]