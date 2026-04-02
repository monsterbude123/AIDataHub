# =============================================================================
# API Gateway Dockerfile
# =============================================================================
# Build:
#   docker build -f services/api-gateway/Dockerfile -t ai-datahub/api-gateway:latest .
#
# Run:
#   docker run -p 3000:3000 --env-file .env ai-datahub/api-gateway:latest
# =============================================================================

# Use pre-built base image
FROM ai-datahub-base:latest AS runner

# Service metadata
LABEL service="api-gateway"
LABEL description="AI DataHub API Gateway - unified entrypoint with routing"
LABEL version="0.1.0"

# Expose port
EXPOSE 3000

# Set service name for healthcheck and logging
ENV SERVICE_NAME=api-gateway
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the service
CMD ["node", "services/api-gateway/dist/main.js"]