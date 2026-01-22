#!/bin/bash
# Container Health Monitoring Script
# This script monitors Docker container health and sends alerts on failures

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/logs/health-check.log"
ALERT_EMAIL="${ALERT_EMAIL:-admin@example.com}"

# Containers to monitor
CONTAINERS=("frontend-app" "backend-api" "mongodb-db")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Check if container exists and is running
check_container_exists() {
    local container=$1
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
        log "${RED}ERROR: Container '$container' does not exist${NC}"
        return 1
    fi
    return 0
}

# Get container health status
get_health_status() {
    local container=$1
    docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "unknown"
}

# Get container running status
get_running_status() {
    local container=$1
    docker inspect --format='{{.State.Running}}' "$container" 2>/dev/null || echo "false"
}

# Send alert
send_alert() {
    local container=$1
    local status=$2
    local message="⚠️  Container Alert: '$container' is $status at $(date '+%Y-%m-%d %H:%M:%S')"

    # Log the alert
    log "${YELLOW}ALERT: $message${NC}"

    # Call alert script if it exists
    if [ -x "${SCRIPT_DIR}/alert.sh" ]; then
        "${SCRIPT_DIR}/alert.sh" "$container" "$status"
    fi

    # Send email if mail command is available
    if command -v mail &> /dev/null && [ -n "$ALERT_EMAIL" ]; then
        echo "$message

For more details, check the logs at: $LOG_FILE

Container Details:"
        docker inspect "$container" | mail -s "Container Alert: $container" "$ALERT_EMAIL"
        log "${YELLOW}Email alert sent to $ALERT_EMAIL${NC}"
    fi
}

# Send recovery notification
send_recovery() {
    local container=$1
    local message="✅ Container '$container' has recovered and is now healthy at $(date '+%Y-%m-%d %H:%M:%S')"

    log "${GREEN}$message${NC}"

    # Send email if mail command is available
    if command -v mail &> /dev/null && [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "Container Recovered: $container" "$ALERT_EMAIL"
    fi
}

# Track previous state for recovery detection
STATE_FILE="${PROJECT_ROOT}/logs/.container-state"
mkdir -p "$(dirname "$STATE_FILE")"
touch "$STATE_FILE"

# Main monitoring loop
main() {
    log "=== Starting health check ==="

    for container in "${CONTAINERS[@]}"; do
        # Check if container exists
        if ! check_container_exists "$container"; then
            continue
        fi

        # Get current status
        running=$(get_running_status "$container")
        health=$(get_health_status "$container")

        # Read previous state
        prev_health=$(grep "^${container}:" "$STATE_FILE" 2>/dev/null | cut -d':' -f2- || echo "")

        log "Checking '$container': running=$running, health=$health"

        # Handle unhealthy or not running containers
        if [ "$running" != "true" ]; then
            if [ "$prev_health" != "not_running" ]; then
                send_alert "$container" "not running"
                echo "${container}:not_running" >> "$STATE_FILE"
            fi
        elif [ "$health" = "unhealthy" ]; then
            if [ "$prev_health" != "unhealthy" ]; then
                send_alert "$container" "unhealthy"
                echo "${container}:unhealthy" >> "$STATE_FILE"
            fi
        elif [ "$health" = "healthy" ]; then
            # Check if this is a recovery
            if [ "$prev_health" = "unhealthy" ] || [ "$prev_health" = "not_running" ]; then
                send_recovery "$container"
            fi
            # Update state to healthy
            grep -v "^${container}:" "$STATE_FILE" > "${STATE_FILE}.tmp" 2>/dev/null || true
            mv "${STATE_FILE}.tmp" "$STATE_FILE" 2>/dev/null || true
            echo "${container}:healthy" >> "$STATE_FILE"
        fi
    done

    log "=== Health check complete ==="
}

# Run main function
main "$@"
