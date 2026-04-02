# =============================================================================
# System Auth Service Dockerfile
# =============================================================================
# Build:
#   docker build -f services/system-auth-service/Dockerfile -t ai-datahub/auth-service:latest .
#
# Run:
#   docker run -p 4001:4001 --env-file .env ai-datahub/auth-service:latest
# =============================================================================

FROM ai-datahub-base:latest AS runner

LABEL service="system-auth-service"
LABEL description="AI DataHub Authentication Service"
LABEL version="0.1.0"

EXPOSE 4001

ENV SERVICE_NAME=system-auth-service
ENV PORT=4001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4001/health || exit 1

CMD ["node", "services/system-auth-service/dist/main.js"]