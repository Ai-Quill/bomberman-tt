#!/bin/bash

# Script to generate all texture types for the Bomberman game using Python
# Usage: ./generate_all_textures.sh [api_key]
# Example: ./generate_all_textures.sh r8_your_api_key

# Check if API key is provided
if [ -z "$1" ]; then
    echo "Error: API key is required."
    echo "Usage: ./generate_all_textures.sh [api_key]"
    echo "Example: ./generate_all_textures.sh r8_your_api_key"
    exit 1
fi

# Store API key
API_KEY="$1"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 to use this script."
    exit 1
fi

echo "===== BOMBERMAN TEXTURE GENERATOR ====="
echo "This script will generate all texture types for the game."
echo "This may take some time as each texture requires an API call."
echo "=================================================="

# Array of all texture types
TEXTURE_TYPES=("player" "enemy" "bomb" "explosion" "wall" "breakable" "powerup")

# Create the output directory if it doesn't exist
mkdir -p assets/textures/generated

# Generate each texture type
for type in "${TEXTURE_TYPES[@]}"; do
    echo ""
    echo "===== Generating $type textures ====="
    ./generate_textures.sh "$type" "$API_KEY"
    echo "===== Completed $type textures ====="
    echo ""
    
    # Add a small delay between API calls to avoid rate limiting
    sleep 2
done

echo ""
echo "===== ALL TEXTURES GENERATED SUCCESSFULLY ====="
echo "Textures are saved in assets/textures/generated/"
echo "You can now use these textures in your game."
echo ""

# List all generated textures
echo "Generated textures:"
ls -la assets/textures/generated/

echo ""
echo "Done!" 