#!/bin/bash

# Read database connection details from .env file (if available)
if [ -f .env ]; then
  # Extract DATABASE_URL value from .env file
  DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2)
  echo "Found DATABASE_URL: $DATABASE_URL"
fi

# Extract database connection parts
DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:]*).*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')
DB_NAME=$(echo $DATABASE_URL | sed -E 's/.*\/([^?]*).*/\1/')
DB_USER=$(echo $DATABASE_URL | sed -E 's/.*:\/\/([^:]*).*/\1/')
DB_PASS=$(echo $DATABASE_URL | sed -E 's/.*:\/\/[^:]*:([^@]*)@.*/\1/')

echo "Database info:"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Name: $DB_NAME"
echo "User: $DB_USER"

echo "Resetting database schema..."
# Since we can't use psql directly in Git Bash, use npx prisma directly
echo "Running npx prisma migrate reset..."
npx prisma migrate reset --force

echo "Generating Prisma client..."
npx prisma generate

echo "Database has been reset and seeded successfully!" 