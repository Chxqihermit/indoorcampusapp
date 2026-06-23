#!/bin/sh
set -e

cd /var/www/html

if [ ! -f .env ]; then
  cp .env.example .env
fi

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:CHANGEME=" ]; then
  php artisan key:generate --force --no-interaction
fi

echo "Waiting for database at ${DB_HOST}:${DB_PORT}..."
until php -r "
  try {
    new PDO(
      'mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE'),
      getenv('DB_USERNAME'),
      getenv('DB_PASSWORD'),
      [PDO::ATTR_TIMEOUT => 3]
    );
    exit(0);
  } catch (Throwable \$e) {
    exit(1);
  }
"; do
  sleep 2
done

php artisan config:clear
php artisan migrate --force --no-interaction
php artisan db:seed --force --no-interaction || true

exec apache2-foreground
