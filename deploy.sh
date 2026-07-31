#!/usr/bin/env bash

set -euo pipefail

APP_DIR="/home/sark/apps/wedding_budget_backend"
HEALTHCHECK_URL="http://localhost:8000/api/health"
MAX_RETRIES=30
RETRY_INTERVAL=2

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

echo "=========================================="
log "PlannerHub Deployment Started"
echo "=========================================="

# Validate required environment variables
: "${IMAGE_TAG:?IMAGE_TAG environment variable is required}"

log "Deploying image with tag: $IMAGE_TAG"

cd "$APP_DIR" || {
    log "Application directory not found."
    exit 1
}

log "Pulling the backend image..."
docker compose pull backend

log "Restarting the backend service..."
docker compose up -d backend

log "Waiting for the backend service to become healthy..."

for ((i = 1; i <= MAX_RETRIES; i++)); do
    if curl -fs "$HEALTHCHECK_URL"  >/dev/null; then
        log "Application is healthy"
        log "Deployment completed successfully"
        exit 0
    fi

    log "Health check failed ($i/$MAX_RETRIES). Retrying in $RETRY_INTERVAL seconds..."
    sleep "$RETRY_INTERVAL"
done

log "Error: Application failed health check after $((MAX_RETRIES * RETRY_INTERVAL)) seconds."

exit 1