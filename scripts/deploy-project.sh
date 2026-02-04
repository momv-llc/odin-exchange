#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
  echo -e "${GREEN}$1${NC}"
}

log_warn() {
  echo -e "${YELLOW}$1${NC}"
}

log_error() {
  echo -e "${RED}$1${NC}"
}

require_command() {
  local command_name="$1"
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    log_error "❌ Требуется ${command_name}. Установите и повторите попытку."
    exit 1
  fi
}

detect_package_manager() {
  if command -v pnpm >/dev/null 2>&1; then
    echo "pnpm"
    return
  fi

  if command -v npm >/dev/null 2>&1; then
    echo "npm"
    return
  fi

  if command -v yarn >/dev/null 2>&1; then
    echo "yarn"
    return
  fi

  log_error "❌ Не найден пакетный менеджер (pnpm/npm/yarn)."
  exit 1
}

resolve_compose() {
  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
    return
  fi

  if command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
    return
  fi

  log_error "❌ Docker Compose не найден. Установите docker compose или docker-compose."
  exit 1
}

install_dependencies() {
  local target_dir="$1"
  local manager="$2"

  if [[ ! -d "${target_dir}" ]]; then
    log_warn "⚠️  Каталог ${target_dir} не найден, пропускаем."
    return
  fi

  if [[ ! -f "${target_dir}/package.json" ]]; then
    log_warn "⚠️  В ${target_dir} нет package.json, пропускаем."
    return
  fi

  log_info "📦 Установка зависимостей в ${target_dir} (${manager})..."
  pushd "${target_dir}" >/dev/null
  case "${manager}" in
    pnpm)
      pnpm install
      ;;
    npm)
      npm install
      ;;
    yarn)
      yarn install
      ;;
  esac
  popd >/dev/null
}

log_info "🔍 Проверка зависимостей..."
require_command node
require_command docker

PACKAGE_MANAGER="$(detect_package_manager)"
COMPOSE_COMMAND="$(resolve_compose)"

log_info "✅ Пакетный менеджер: ${PACKAGE_MANAGER}"
log_info "✅ Docker Compose: ${COMPOSE_COMMAND}"

if [[ -f ".env.example" && ! -f ".env" ]]; then
  log_warn "ℹ️  .env не найден, копируем из .env.example."
  cp .env.example .env
fi

install_dependencies "backend" "${PACKAGE_MANAGER}"
install_dependencies "frontend" "${PACKAGE_MANAGER}"

log_info "🚀 Разворачиваем проект через Docker Compose..."
${COMPOSE_COMMAND} up -d

log_info "✅ Готово. Проверьте логи: ${COMPOSE_COMMAND} logs -f"
