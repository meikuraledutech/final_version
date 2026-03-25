.PHONY: help migrate seed reset-db setup

help:
	@echo "Available commands:"
	@echo "  make migrate      - Run database migrations"
	@echo "  make seed         - Seed database with initial data (superadmin)"
	@echo "  make reset-db     - Reset and create fresh database"
	@echo "  make setup        - Full setup: reset-db, migrate, and seed"

migrate:
	@echo "Running migrations..."
	@node db/migrate.js

seed:
	@echo "Seeding database..."
	@node db/seed.js

reset-db:
	@echo "Resetting database..."
	@PGPASSWORD=$(DB_PASSWORD) psql -h $(DB_HOST) -U $(DB_USER) -c "DROP DATABASE IF EXISTS $(DB_NAME);" || true
	@PGPASSWORD=$(DB_PASSWORD) psql -h $(DB_HOST) -U $(DB_USER) -c "CREATE DATABASE $(DB_NAME);"
	@echo "Database reset complete"

setup: reset-db migrate seed
	@echo "✅ Database setup complete!"

.PHONY: clean
clean:
	@echo "Cleaning up..."
	@rm -rf /tmp/submissions || true
	@echo "Cleanup complete"

# Include .env variables
-include ../.env
DB_HOST ?= localhost
DB_PORT ?= 5432
DB_NAME ?= meikural
DB_USER ?= postgres
DB_PASSWORD ?= postgres
