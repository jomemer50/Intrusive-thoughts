#!/bin/bash

echo "========================================="
echo "  Rungtatron Installation Script"
echo "========================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/ and try again."
    exit 1
fi

# Install dependencies
echo "[INFO] Installing npm dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install npm dependencies."
    exit 1
fi
echo "[INFO] Dependencies installed successfully."
echo ""

# Setup environment variables
if [ ! -f ".env.local" ]; then
    echo "[INFO] Setting up environment variables..."
    read -p "Please enter your OpenRouter API Key: " API_KEY
    echo "OPENROUTER_API_KEY=$API_KEY" > .env.local
    echo "[INFO] .env.local created successfully."
else
    echo "[INFO] .env.local already exists. Skipping environment setup."
fi

echo ""
echo "========================================="
echo "  Installation Complete!"
echo "========================================="
echo ""
echo "To start the application, run:"
echo "   npm run dev"
echo ""
