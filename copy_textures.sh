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
# First check for specific enemy colors
if [ -f assets/textures/generated/enemy_red_0.png ]; then
    echo "Copying red enemy texture..."
    cp assets/textures/generated/enemy_red_0.png assets/textures/enemy_red.png
    echo "Red enemy texture copied."
elif [ -f assets/textures/generated/enemy_0.png ]; then
    echo "Using generic enemy texture for red enemy..."
    cp assets/textures/generated/enemy_0.png assets/textures/enemy_red.png
    echo "Red enemy texture copied."
fi

if [ -f assets/textures/generated/enemy_blue_0.png ]; then
    echo "Copying blue enemy texture..."
    cp assets/textures/generated/enemy_blue_0.png assets/textures/enemy_blue.png
    echo "Blue enemy texture copied."
elif [ -f assets/textures/generated/enemy_0.png ]; then
    echo "Using generic enemy texture for blue enemy..."
    cp assets/textures/generated/enemy_0.png assets/textures/enemy_blue.png
    echo "Blue enemy texture copied."
fi

if [ -f assets/textures/generated/enemy_green_0.png ]; then
    echo "Copying green enemy texture..."
    cp assets/textures/generated/enemy_green_0.png assets/textures/enemy_green.png
    echo "Green enemy texture copied."
elif [ -f assets/textures/generated/enemy_0.png ]; then
    echo "Using generic enemy texture for green enemy..."
    cp assets/textures/generated/enemy_0.png assets/textures/enemy_green.png
    echo "Green enemy texture copied."
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

# Copy and rename breakable wall textures (crate/barrel)
if [ -f assets/textures/generated/barrel_0.png ]; then
    echo "Copying barrel texture..."
    cp assets/textures/generated/barrel_0.png assets/textures/barrel.png
    echo "Barrel texture copied."
elif [ -f assets/textures/generated/breakable_0.png ]; then
    echo "Using generic breakable texture for barrel..."
    cp assets/textures/generated/breakable_0.png assets/textures/barrel.png
    echo "Barrel texture copied."
fi

if [ -f assets/textures/generated/breakable_0.png ]; then
    echo "Copying crate texture..."
    cp assets/textures/generated/breakable_0.png assets/textures/crate.png
    echo "Crate texture copied."
fi

# Copy and rename floor textures
if [ -f assets/textures/generated/floor_0.png ]; then
    echo "Copying floor texture..."
    cp assets/textures/generated/floor_0.png assets/textures/floor.png
    echo "Floor texture copied."
fi

if [ -f assets/textures/generated/floor_ice_0.png ]; then
    echo "Copying ice floor texture..."
    cp assets/textures/generated/floor_ice_0.png assets/textures/floor_ice.png
    echo "Ice floor texture copied."
fi

if [ -f assets/textures/generated/floor_sand_0.png ]; then
    echo "Copying sand floor texture..."
    cp assets/textures/generated/floor_sand_0.png assets/textures/floor_sand.png
    echo "Sand floor texture copied."
fi

# Copy and rename powerup textures
if [ -f assets/textures/generated/powerup_bomb_0.png ]; then
    echo "Copying bomb powerup texture..."
    cp assets/textures/generated/powerup_bomb_0.png assets/textures/powerup_bomb.png
    echo "Bomb powerup texture copied."
elif [ -f assets/textures/generated/powerup_0.png ]; then
    echo "Using generic powerup texture for bomb powerup..."
    cp assets/textures/generated/powerup_0.png assets/textures/powerup_bomb.png
    echo "Bomb powerup texture copied."
fi

if [ -f assets/textures/generated/powerup_range_0.png ]; then
    echo "Copying range powerup texture..."
    cp assets/textures/generated/powerup_range_0.png assets/textures/powerup_range.png
    echo "Range powerup texture copied."
elif [ -f assets/textures/generated/powerup_0.png ]; then
    echo "Using generic powerup texture for range powerup..."
    cp assets/textures/generated/powerup_0.png assets/textures/powerup_range.png
    echo "Range powerup texture copied."
fi

if [ -f assets/textures/generated/powerup_speed_0.png ]; then
    echo "Copying speed powerup texture..."
    cp assets/textures/generated/powerup_speed_0.png assets/textures/powerup_speed.png
    echo "Speed powerup texture copied."
elif [ -f assets/textures/generated/powerup_0.png ]; then
    echo "Using generic powerup texture for speed powerup..."
    cp assets/textures/generated/powerup_0.png assets/textures/powerup_speed.png
    echo "Speed powerup texture copied."
fi

# Copy and rename crystal texture
if [ -f assets/textures/generated/crystal_0.png ]; then
    echo "Copying crystal texture..."
    cp assets/textures/generated/crystal_0.png assets/textures/crystal.png
    echo "Crystal texture copied."
elif [ -f assets/textures/generated/powerup_0.png ]; then
    echo "Using generic powerup texture for crystal..."
    cp assets/textures/generated/powerup_0.png assets/textures/crystal.png
    echo "Crystal texture copied."
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