# =============================================================================
# Security Service Dockerfile
# =============================================================================

FROM ai-datahub-base:latest AS runner

LABEL service="security-service"
LABEL description="AI DataHub Security Service - data protection and lifecycle"
LABEL version="0.1.0"

EXPOSE 3006

ENV SERVICE_NAME=security-service
ENV PORT=3006

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3006/health || exit 1

CMD ["node", "services/security-service/dist/main.js"]