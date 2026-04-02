# =============================================================================
# Admin Service Dockerfile
# =============================================================================

FROM ai-datahub-base:latest AS runner

LABEL service="admin-service"
LABEL description="AI DataHub Admin Service - system management"
LABEL version="0.1.0"

EXPOSE 3003

ENV SERVICE_NAME=admin-service
ENV PORT=3003

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3003/health || exit 1

CMD ["node", "services/admin-service/dist/main.js"]