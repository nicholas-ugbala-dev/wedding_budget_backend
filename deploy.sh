#!/usr/bin/env bash

set -euo pipefail

APP_DIR="/home/sark/apps/wedding_budget_backend"
HEALTHCHECK_URL="http://localhost/api/health"
MAX_RETRIES=30
RETRY_INTERVAL=2

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

wait_for_health() {
    for ((i = 1; i <= MAX_RETRIES; i++)); do
        if curl -fs "$HEALTHCHECK_URL" >/dev/null; then
            return 0
        fi

        log "Health check failed ($i/$MAX_RETRIES). Retrying in $RETRY_INTERVAL seconds..."
        sleep "$RETRY_INTERVAL"
    done

    return 1;
}

update_image_tag() {
    local tag="$1"

    if grep -q '^IMAGE_TAG=' .env; then
        sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=$tag|" .env
    else
        printf '\nIMAGE_TAG=%s\n' "$tag" >> .env
    fi
}

rollback() {
    if [ -z "$PREVIOUS_TAG" ]; then
    log "No previous Image available for rollback"
    exit 1
    fi

    log "Rolling back previous tag: $PREVIOUS_TAG"

    if ! update_image_tag "$PREVIOUS_TAG"; then
        log "Rollback failed while restoring the IMAGE_TAG in .env"
        exit 1
    fi

    if docker image inspect "$PREVIOUS_IMAGE" >/dev/null 2>&1; then
        log "Previous Image already exists locally"
    else
        log "Previous image not found locally. Pulling previous image..."

        if ! docker pull "$PREVIOUS_IMAGE"; then
        log "Rollback failed: unable to pull previous image"
        exit 1
        fi
    fi

    if ! IMAGE_TAG="$PREVIOUS_IMAGE" docker compose up -d --no-deps backend; then
        log "Rollback failed while recreating the previous container"
        exit 1
    fi

    if wait_for_health; then
        log "Rollback succeeded. Application restored to previous version."
        log "Deployment failed, but service recovered."
        exit 1
    fi

    log "Deployment and Rollback failed. Application is currently down"
    exit 1
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

if [ -n "$CURRENT_CONTAINER_ID" ]; then
    PREVIOUS_IMAGE="$(
        docker inspect \
        --format '{{.Config.Image}}' \
        "$CURRENT_CONTAINER_ID"
    )"
fi

log "Previous image: ${PREVIOUS_IMAGE:-none}"

PREVIOUS_TAG=""

if [ -n "$PREVIOUS_IMAGE" ]; then
    PREVIOUS_TAG="${PREVIOUS_IMAGE##*:}"
fi

log "Previous tag: ${PREVIOUS_TAG:-none}"

log "Updating deployment state with target tag: ${IMAGE_TAG}"
if ! update_image_tag "$IMAGE_TAG"; then
    log "Failed to update latest deployment tag in .env"
    exit 1
fi

log "Pulling the backend image..."
if ! docker compose pull backend; then
    log "Failed to pull target Image"
    rollback
fi

log "Restarting the backend service..."
if ! docker compose up -d --no-deps backend; then
    log "Failed to create new container service"
    rollback
fi

log "Waiting for the backend service to become healthy..."

if wait_for_health; then
    log "Application is healthy"
    log "Deployment completed successfully"
    exit 0
fi

log "New Deployment failed health check"
rollback