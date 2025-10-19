#!/bin/bash

# Ordinal Strategy Next.js Setup Script
# Run this to quickly set up your development environment

echo "🚀 Ordinal Strategy - Next.js Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    exit 1
fi

echo "✅ .env.local file found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check MongoDB connection
echo "🔍 Checking environment configuration..."

# Read MONGODB_URI from .env.local
MONGODB_URI=$(grep MONGODB_URI .env.local | cut -d '=' -f2)
PRIVY_APP_ID=$(grep NEXT_PUBLIC_PRIVY_APP_ID .env.local | cut -d '=' -f2)

if [[ $MONGODB_URI == *"your_"* ]] || [[ $MONGODB_URI == *"localhost"* ]]; then
    echo "⚠️  MongoDB URI needs to be configured in .env.local"
    echo "   Option 1: Use MongoDB Atlas (recommended)"
    echo "   Option 2: Install MongoDB locally"
fi

if [[ $PRIVY_APP_ID == *"your_"* ]]; then
    echo "⚠️  Privy App ID needs to be configured in .env.local"
    echo "   Get your credentials from: https://dashboard.privy.io/"
fi

echo ""
echo "📋 Setup Checklist:"
echo "   [ ] MongoDB configured"
echo "   [ ] Privy App ID configured"
echo "   [ ] Privy App Secret configured"
echo ""

# Ask if user wants to start dev server
read -p "🚀 Start development server now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting development server..."
    echo "Open http://localhost:3000 in your browser"
    echo ""
    npm run dev
else
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "To start the development server, run:"
    echo "   npm run dev"
    echo ""
    echo "📚 Check out QUICKSTART.md for next steps!"
fi

