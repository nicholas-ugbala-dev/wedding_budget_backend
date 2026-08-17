#!/usr/bin/env bash

set -euo pipefail

APP_DIR="/home/sark/apps/wedding_budget_backend"
HEALTHCHECK_URL="http://localhost/api/health"
MAX_RETRIES=30
RETRY_INTERVAL=2

update_image_tag() {
    local tag="$1"

    if grep -q '^IMAGE_TAG=' .env; then
        sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=$tag|" .env
    else
        printf '\nIMAGE_TAG=%s\n' "$tag" >> .env
    fi
}

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

CURRENT_CONTAINER_ID="$(
    docker compose ps -a -q backend 2>/dev/null || true
)"

PREVIOUS_IMAGE=""

if [-n "$CURRENT_CONTAINER_ID"]; then
    PREVIOUS_IMAGE="$(
        docker inspect \
        --format '{{.Config.Image}}' \
        "$CURRENT_CONTAINER_ID"
    )"
fi

log "Previous image: ${PREVIOUS_IMAGE:-none}"


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