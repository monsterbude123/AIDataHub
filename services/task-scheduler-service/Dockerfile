# =============================================================================
# Task Scheduler Service Dockerfile
# =============================================================================

FROM ai-datahub-base:latest AS runner

LABEL service="task-scheduler-service"
LABEL description="AI DataHub Task Scheduler Service"
LABEL version="0.1.0"

EXPOSE 5001

ENV SERVICE_NAME=task-scheduler-service
ENV PORT=5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1

CMD ["node", "services/task-scheduler-service/dist/main.js"]