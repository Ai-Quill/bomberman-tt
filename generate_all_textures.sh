#!/bin/bash

# Script to generate all texture types for the Bomberman game using Python
# Usage: ./generate_all_textures.sh [api_key] [variation_count]
# Example: ./generate_all_textures.sh r8_your_api_key 2

# Check if API key is provided
if [ -z "$1" ]; then
    echo "Error: API key is required."
    echo "Usage: ./generate_all_textures.sh [api_key] [variation_count]"
    echo "Example: ./generate_all_textures.sh r8_your_api_key 2"
    exit 1
fi

# Store API key
API_KEY="$1"

# Get variation count (default to 1 if not specified)
VARIATION_COUNT=${2:-1}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 to use this script."
    exit 1
fi

echo "===== BOMBERMAN TEXTURE GENERATOR ====="
echo "This script will generate all texture types for the game."
echo "Generating $VARIATION_COUNT variation(s) for each texture type."
echo "This may take some time as each texture requires an API call."
echo "=================================================="

# Create a timestamp for the backup directory
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="assets/textures/backup_${TIMESTAMP}"

# Backup existing textures
if [ -d "assets/textures" ]; then
    echo "Backing up existing textures to ${BACKUP_DIR}..."
    mkdir -p "${BACKUP_DIR}"
    find assets/textures -name "*.png" -type f -exec cp {} "${BACKUP_DIR}/" \;
    echo "Backup completed."
fi

# Array of all basic texture types
BASIC_TYPES=(
    "player" "player_alt" "player_girl" 
    "enemy" "enemy_red" "enemy_blue" "enemy_green" "enemy_boss"
    "bomb" "bomb_alt" 
    "explosion" "explosion_blue"
    "wall" "wall_stone" 
    "breakable" "metal_crate" "ice_block"
    "powerup" "powerup_bomb" "powerup_range" "powerup_speed" "powerup_life" "powerup_shield"
    "floor" "floor_ice" "floor_sand" "floor_lava"
    "crystal" "barrel"
)

# Create the output directory if it doesn't exist
mkdir -p assets/textures/generated

# Clean the generated directory to ensure fresh generation
echo "Cleaning generated textures directory..."
rm -f assets/textures/generated/*.png

# Generate each texture type
for type in "${BASIC_TYPES[@]}"; do
    echo ""
    echo "===== Generating $type textures ($VARIATION_COUNT variation(s)) ====="
    ./generate_textures.sh "$type" "$API_KEY" "" "$VARIATION_COUNT"
    echo "===== Completed $type textures ====="
    echo ""
    
    # Add a small delay between API calls to avoid rate limiting
    sleep 2
done

# Copy the generated textures to the main textures directory
echo ""
echo "===== Copying best textures to main directory ====="

# Function to copy the best variation of each texture type to the main directory
copy_best_textures() {
    local type=$1
    local var_num=${2:-0}  # Default to variation 0 if not specified
    
    # Find the best image for this texture type (usually the first one, index 0)
    local source_file="assets/textures/generated/${type}_var${var_num}_0.png"
    local target_file="assets/textures/${type}.png"
    
    if [ -f "$source_file" ]; then
        echo "Copying $source_file to $target_file"
        cp "$source_file" "$target_file"
    else
        echo "Warning: Could not find $source_file"
    fi
}

# Copy the best variation of each texture type
for type in "${BASIC_TYPES[@]}"; do
    copy_best_textures "$type"
done

echo ""
echo "===== ALL TEXTURES GENERATED SUCCESSFULLY ====="
echo "Textures are saved in assets/textures/generated/"
echo "Best variations are copied to assets/textures/"
echo "Original textures are backed up in ${BACKUP_DIR}/"
echo "You can now use these textures in your game."
echo ""

# List all generated textures
echo "Generated textures:"
ls -la assets/textures/generated/ | head -20
echo "... (and more)"

echo ""
echo "Main textures:"
ls -la assets/textures/*.png | head -20
echo "... (and more)"

echo ""
echo "Done!" 