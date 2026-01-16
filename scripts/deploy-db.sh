#!/bin/bash
# Run this script on your Dokploy server to set up and seed the database

cd /path/to/your/app  # Update this path

echo "🏗️  Setting up database..."
npm run db:setup

echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database ready!"
