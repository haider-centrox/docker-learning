#!/bin/bash
# Alert Notification Script
# This script sends alerts when containers have issues

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_ROOT}/logs/alerts.log"
ALERT_EMAIL="${ALERT_EMAIL:-admin@example.com}"

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Alert levels
ALERT_CRITICAL=0
ALERT_WARNING=1
ALERT_INFO=2

# Current alert level (set via parameter)
ALERT_LEVEL=${ALERT_LEVEL:-$ALERT_WARNING}

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Send alert notification
send_alert() {
    local container=$1
    local status=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local hostname=$(hostname)
    local uptime=$(uptime -p 2>/dev/null || uptime)

    # Build alert message
    local message="⚠️  CONTAINER ALERT

Container: $container
Status: $status
Hostname: $hostname
Timestamp: $timestamp
System Uptime: $uptime"

    # Get container details
    if docker inspect "$container" &> /dev/null; then
        local exit_code=$(docker inspect --format='{{.State.ExitCode}}' "$container" 2>/dev/null || echo "N/A")
        local oom_killed=$(docker inspect --format='{{.State.OOMKilled}}' "$container" 2>/dev/null || echo "false")
        local restart_count=$(docker inspect --format='{{.RestartCount}}' "$container" 2>/dev/null || echo "0")

        message="$message

Exit Code: $exit_code
OOM Killed: $oom_killed
Restart Count: $restart_count"
    fi

    # Determine subject based on status
    local subject="[ALERT] Container $container - $status"
    if [ "$status" = "not running" ] || [ "$status" = "unhealthy" ]; then
        subject="[CRITICAL] Container Alert: $container is $status"
    fi

    # Log the alert
    log "$message"

    # Send email if mail command is available
    if command -v mail &> /dev/null && [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
        log "Email alert sent to $ALERT_EMAIL"
    else
        log "Mail command not available or ALERT_EMAIL not set"
    fi

    # Send webhook if configured
    if [ -n "$ALERT_WEBHOOK" ]; then
        curl -X POST "$ALERT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"container\":\"$container\",\"status\":\"$status\",\"timestamp\":\"$timestamp\"}" \
            2>/dev/null || log "Failed to send webhook to $ALERT_WEBHOOK"
    fi

    # Write to alert log for external monitoring
    echo "{\"timestamp\":\"$timestamp\",\"container\":\"$container\",\"status\":\"$status\",\"level\":$ALERT_LEVEL}" >> "${PROJECT_ROOT}/logs/alerts.jsonl"
}

# Main function
main() {
    local container=$1
    local status=${2:-"unknown"}

    if [ -z "$container" ]; then
        log "Error: No container specified"
        exit 1
    fi

    send_alert "$container" "$status"
}

# Run main function if script is executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
