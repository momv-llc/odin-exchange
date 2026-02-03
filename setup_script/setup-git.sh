#!/bin/bash
#===============================================================================
# Настройка Git для push в репозиторий
# Выполните этот скрипт если хотите отправлять изменения на GitHub
#===============================================================================

APP_DIR="/opt/odin-exchange"
cd $APP_DIR

echo "=== Настройка Git для ODIN Exchange ==="
echo ""

# Настройка имени и email
read -p "Введите ваше имя для Git: " GIT_NAME
read -p "Введите ваш email для Git: " GIT_EMAIL

git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

echo ""
echo "Для push на GitHub вам нужен Personal Access Token."
echo "1. Перейдите на https://github.com/settings/tokens"
echo "2. Создайте новый token (classic) с правами 'repo'"
echo "3. Используйте token как пароль при push"
echo ""

# Настраиваем credential helper для сохранения токена
git config credential.helper store

echo "При первом push введите:"
echo "  Username: ваш GitHub username"  
echo "  Password: ваш Personal Access Token"
echo ""

# Создаём скрипт синхронизации
cat > /usr/local/bin/odin-sync << 'EOF'
#!/bin/bash
APP_DIR="/opt/odin-exchange"
cd $APP_DIR || exit 1

if [ -z "$1" ]; then
    echo "Использование: odin-sync 'Описание изменений'"
    exit 1
fi

echo "📝 Изменённые файлы:"
git status --short
echo ""

git add -A
git commit -m "$1"
git push origin main 2>/dev/null || git push origin master

echo "✅ Изменения отправлены!"
EOF

chmod +x /usr/local/bin/odin-sync

echo "✅ Git настроен!"
echo ""
echo "Теперь вы можете использовать:"
echo "  odin-sync 'Описание изменений' - Отправить изменения на GitHub"
