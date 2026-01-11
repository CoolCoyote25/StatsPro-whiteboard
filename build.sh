#!/bin/bash

echo "🏀 StatsPro Whiteboard - Clean Build"
echo "======================================"
echo ""

# Check Node version
NODE_VERSION=$(node --version)
echo "✓ Node version: $NODE_VERSION"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build web app
echo ""
echo "🔨 Building web app..."
npm run build

# Copy assets to dist
echo ""
echo "🏀 Copying assets..."
cp public/court-background.png dist/
cp public/app-icon.png dist/
cp public/app-icon-192.png dist/
cp public/app-icon-512.png dist/

# Setup Capacitor
if [ ! -f "capacitor.config.ts" ]; then
    echo ""
    echo "🔧 Initializing Capacitor..."
    npx cap init "StatsPro Whiteboard" "com.basketball.whiteboard" --web-dir=dist
fi

if [ ! -d "android" ]; then
    echo ""
    echo "📱 Adding Android platform..."
    npx cap add android
fi

# Sync (this copies web assets AND should use our icon files)
echo ""
echo "🔄 Syncing with Android..."
npx cap sync android

# CLEAN Android build (this is the key!)
echo ""
echo "🧹 Cleaning Android build cache..."
cd android
./gradlew clean

# Build APK
echo ""
echo "🏗️  Building APK (fresh build)..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUCCESS!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📱 APK Location:"
    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "🎨 App Icon:"
    echo "   ✓ Custom basketball icon (hoop, ball, X's, O's, arrows)"
    echo "   ✓ Fresh build - no cache"
    echo ""
    echo "🏀 Features:"
    echo "   ✓ RED and BLACK drawing colors"
    echo "   ✓ SOLID and DASHED line styles"
    echo "   ✓ Two-finger eraser gesture"
    echo "   ✓ UNDO and CLEAR buttons"
    echo "   ✓ Players mode (1-5)"
    echo "   ✓ Ball possession tracking"
    echo "   ✓ Basketball orange theme"
    echo "   ✓ Compact UI design"
    echo ""
    echo "📋 Installation:"
    echo "   1. Transfer APK to your Xiaomi Pad 7"
    echo "   2. UNINSTALL old version first (important for icon!)"
    echo "   3. Install the new APK"
    echo "   4. Basketball icon should appear!"
    echo ""
else
    echo ""
    echo "❌ Build failed"
    cd ..
    exit 1
fi

cd ..
