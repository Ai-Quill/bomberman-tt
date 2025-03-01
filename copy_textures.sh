#!/bin/bash

# Script to copy generated textures to the correct locations
# Usage: ./copy_textures.sh

echo "===== COPYING GENERATED TEXTURES ====="

# Create backup directory for original textures
mkdir -p assets/textures/original_backup

# Backup original textures if not already backed up
if [ ! -f assets/textures/original_backup/player.png ]; then
    echo "Backing up original textures..."
    cp assets/textures/*.png assets/textures/original_backup/
    echo "Original textures backed up to assets/textures/original_backup/"
fi

# Copy and rename player texture
if [ -f assets/textures/generated/player_0.png ]; then
    echo "Copying player texture..."
    cp assets/textures/generated/player_0.png assets/textures/player.png
    echo "Player texture copied."
fi

# Copy and rename enemy textures
if [ -f assets/textures/generated/enemy_0.png ]; then
    echo "Copying enemy textures..."
    # Copy the same enemy texture to all three enemy types
    cp assets/textures/generated/enemy_0.png assets/textures/enemy_red.png
    cp assets/textures/generated/enemy_0.png assets/textures/enemy_blue.png
    cp assets/textures/generated/enemy_0.png assets/textures/enemy_green.png
    echo "Enemy textures copied."
fi

# Copy and rename bomb texture
if [ -f assets/textures/generated/bomb_0.png ]; then
    echo "Copying bomb texture..."
    cp assets/textures/generated/bomb_0.png assets/textures/bomb.png
    echo "Bomb texture copied."
fi

# Copy and rename explosion texture
if [ -f assets/textures/generated/explosion_0.png ]; then
    echo "Copying explosion texture..."
    cp assets/textures/generated/explosion_0.png assets/textures/explosion.png
    echo "Explosion texture copied."
fi

# Copy and rename wall texture
if [ -f assets/textures/generated/wall_0.png ]; then
    echo "Copying wall texture..."
    cp assets/textures/generated/wall_0.png assets/textures/wall.png
    echo "Wall texture copied."
fi

# Copy and rename breakable wall texture (crate/barrel)
if [ -f assets/textures/generated/breakable_0.png ]; then
    echo "Copying breakable wall textures..."
    cp assets/textures/generated/breakable_0.png assets/textures/crate.png
    cp assets/textures/generated/breakable_0.png assets/textures/barrel.png
    echo "Breakable wall textures copied."
fi

# Copy and rename powerup textures
if [ -f assets/textures/generated/powerup_0.png ]; then
    echo "Copying powerup textures..."
    cp assets/textures/generated/powerup_0.png assets/textures/powerup_bomb.png
    cp assets/textures/generated/powerup_0.png assets/textures/powerup_range.png
    cp assets/textures/generated/powerup_0.png assets/textures/powerup_speed.png
    cp assets/textures/generated/powerup_0.png assets/textures/crystal.png
    echo "Powerup textures copied."
fi

echo "===== ALL TEXTURES COPIED SUCCESSFULLY ====="
echo "Original textures have been backed up to assets/textures/original_backup/"
echo "New textures have been copied to assets/textures/"
echo ""
echo "You can now run the game to see the new textures in action."
echo "If you want to revert to the original textures, run:"
echo "cp assets/textures/original_backup/*.png assets/textures/"
echo ""
echo "Done!" 