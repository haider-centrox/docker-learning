#!/bin/bash
# Semantic Release Script
# This script handles semantic versioning and git tagging

set -e

# Configuration
VERSION_TYPE=${1:-patch}
DRY_RUN=${DRY_RUN:-false}
PREFIX=${PREFIX:-v}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not a git repository"
        exit 1
    fi
}

# Check if working directory is clean
check_clean_state() {
    if [ -n "$(git status --porcelain)" ]; then
        log_error "Working directory is not clean. Please commit or stash changes."
        git status --short
        exit 1
    fi
}

# Get current version from package.json
get_current_version() {
    if [ -f "package.json" ]; then
        node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0"
    else
        echo "0.0.0"
    fi
}

# Get latest git tag
get_latest_tag() {
    git describe --tags --abbrev=0 2>/dev/null || echo "${PREFIX}0.0.0"
}

# Bump version
bump_version() {
    local current_version=$1
    local version_type=$2

    # Parse version
    IFS='.' read -r major minor patch <<< "${current_version#v}"

    # Bump according to type
    case "$version_type" in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch|*)
            patch=$((patch + 1))
            ;;
    esac

    echo "${PREFIX}${major}.${minor}.${patch}"
}

# Create git tag
create_tag() {
    local new_version=$1

    log_info "Creating git tag: $new_version"

    if [ "$DRY_RUN" = "true" ]; then
        log_warn "DRY RUN: Would create tag $new_version"
        return
    fi

    # Create annotated tag
    git tag -a "$new_version" -m "Release $new_version" -m "Bumped version: $current_version -> $new_version"

    log_info "Tag created successfully"
}

# Push tags to remote
push_tags() {
    log_info "Pushing tags to remote"

    if [ "$DRY_RUN" = "true" ]; then
        log_warn "DRY RUN: Would push tags to remote"
        return
    fi

    git push origin --tags

    log_info "Tags pushed successfully"
}

# Update package.json version
update_package_version() {
    local new_version=$1

    # Remove 'v' prefix for package.json
    local clean_version="${new_version#v}"

    if [ -f "package.json" ]; then
        if [ "$DRY_RUN" = "true" ]; then
            log_warn "DRY RUN: Would update package.json to $clean_version"
        else
            npm version "$clean_version" --no-git-tag-version
            git add package.json package-lock.json
            git commit -m "chore: bump version to $clean_version"
            log_info "Package version updated to $clean_version"
        fi
    fi
}

# Generate changelog
generate_changelog() {
    local previous_tag=$1
    local new_version=$2

    log_info "Generating changelog"

    # Get commits since last tag
    local commits=$(git log "${previous_tag}..HEAD" --pretty=format:"- %s (%h)" --reverse)

    if [ -z "$commits" ]; then
        commits="No changes since ${previous_tag}"
    fi

    echo "# ${new_version}

$(date '+%Y-%m-%d')

## Changes

${commits}"
}

# Main function
main() {
    local current_version=$(get_current_version)
    local latest_tag=$(get_latest_tag)
    local new_version

    log_info "Current version: $current_version"
    log_info "Latest tag: $latest_tag"
    log_info "Version bump: $VERSION_TYPE"

    # Validate version type
    if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
        log_error "Invalid version type: $VERSION_TYPE"
        log_error "Valid options: major, minor, patch"
        exit 1
    fi

    # Check git repository
    check_git_repo
    check_clean_state

    # Calculate new version
    new_version=$(bump_version "$latest_tag" "$VERSION_TYPE")

    log_info "New version: $new_version"

    # Generate changelog
    local changelog=$(generate_changelog "$latest_tag" "$new_version")
    echo "$changelog"

    # Create changelog file
    if [ -f "CHANGELOG.md" ] && [ "$DRY_RUN" != "true" ]; then
        echo "$changelog" | cat - CHANGELOG.md > TEMP_CHANGELOG.md
        mv TEMP_CHANGELOG.md CHANGELOG.md
        git add CHANGELOG.md
        git commit -m "docs: update changelog for $new_version"
        log_info "Changelog updated"
    fi

    # Update package version
    update_package_version "$new_version"

    # Create and push tag
    create_tag "$new_version"
    push_tags

    log_info "Release $new_version completed successfully!"
    log_info "Don't forget to push your commits: git push"
}

# Run main function
main "$@"
