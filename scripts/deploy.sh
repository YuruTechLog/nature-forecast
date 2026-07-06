#!/bin/bash
# deploy.sh — リポジトリルートを Cloudflare Pages (nature-forecast) へデプロイ
# shared/ tidal/ など全ディレクトリが公開対象
# Usage: ./scripts/deploy.sh [--dry-run]
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"

# .env がなければ tidal-mirror-forecast の .env を参照
if [ ! -f "$ENV_FILE" ]; then
    ENV_FILE="$REPO_ROOT/../tidal-mirror-forecast/.env"
fi

if [ -f "$ENV_FILE" ]; then set -a; source "$ENV_FILE"; set +a; fi

DRY_RUN=""
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "[deploy] DRY-RUN mode"
fi

PROJECT="nature-forecast"
DEPLOY_DIR="$REPO_ROOT"

echo "[deploy] $PROJECT → ."

if [ -z "$DRY_RUN" ]; then
    CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" \
    CLOUDFLARE_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID" \
    npx wrangler pages deploy "$DEPLOY_DIR" \
        --project-name "$PROJECT" \
        --branch main \
        --commit-dirty=true \
        2>&1 | tail -4
    echo "[deploy] Deployed: https://${PROJECT}.pages.dev"
else
    echo "[DRY-RUN] would deploy $DEPLOY_DIR → $PROJECT"
fi

echo "[deploy] 完了"
