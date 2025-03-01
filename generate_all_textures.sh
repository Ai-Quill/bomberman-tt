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

# Array of all basic texture types
BASIC_TYPES=("player" "enemy" "bomb" "explosion" "wall" "breakable" "powerup")

# Array of additional texture types
ADDITIONAL_TYPES=("floor" "floor_ice" "floor_sand" "crystal" "enemy_red" "enemy_blue" "enemy_green")

# Create the output directory if it doesn't exist
mkdir -p assets/textures/generated

# Generate each basic texture type
for type in "${BASIC_TYPES[@]}"; do
    echo ""
    echo "===== Generating $type textures ====="
    ./generate_textures.sh "$type" "$API_KEY"
    echo "===== Completed $type textures ====="
    echo ""
    
    # Add a small delay between API calls to avoid rate limiting
    sleep 2
done

# Generate additional textures with custom prompts
echo ""
echo "===== Generating additional textures ====="

# Generate floor textures
echo "Generating floor texture..."
./generate_textures.sh "floor" "$API_KEY"
sleep 2

# Generate ice floor texture
echo "Generating ice floor texture..."
TEXTURE_TYPE="floor_ice"
PROMPT="A seamless ice floor texture for a bomberman game, with light blue color and subtle cracks. Pixel art style, top-down view, on a transparent background."
./generate_textures.sh "floor_ice" "$API_KEY"
sleep 2

# Generate sand floor texture
echo "Generating sand floor texture..."
TEXTURE_TYPE="floor_sand"
PROMPT="A seamless sand floor texture for a bomberman game, with light tan color and subtle grain patterns. Pixel art style, top-down view, on a transparent background."
./generate_textures.sh "floor_sand" "$API_KEY"
sleep 2

# Generate different enemy types
echo "Generating red enemy texture..."
TEXTURE_TYPE="enemy_red"
PROMPT="A menacing red cartoon enemy character for a bomberman game, with angry eyes and a sinister smile. Pixel art style, vibrant red color scheme, facing forward, on a transparent background."
./generate_textures.sh "enemy_red" "$API_KEY"
sleep 2

echo "Generating blue enemy texture..."
TEXTURE_TYPE="enemy_blue"
PROMPT="A menacing blue cartoon enemy character for a bomberman game, with angry eyes and a sinister smile. Pixel art style, vibrant blue color scheme, facing forward, on a transparent background."
./generate_textures.sh "enemy_blue" "$API_KEY"
sleep 2

echo "Generating green enemy texture..."
TEXTURE_TYPE="enemy_green"
PROMPT="A menacing green cartoon enemy character for a bomberman game, with angry eyes and a sinister smile. Pixel art style, vibrant green color scheme, facing forward, on a transparent background."
./generate_textures.sh "enemy_green" "$API_KEY"
sleep 2

# Generate different power-up types
echo "Generating bomb power-up texture..."
TEXTURE_TYPE="powerup_bomb"
PROMPT="A bomb power-up item for a bomberman game, showing a small bomb icon inside a glowing orb. Pixel art style, vibrant colors, on a transparent background."
./generate_textures.sh "powerup_bomb" "$API_KEY"
sleep 2

echo "Generating range power-up texture..."
TEXTURE_TYPE="powerup_range"
PROMPT="A range power-up item for a bomberman game, showing expanding arrows inside a glowing orb. Pixel art style, vibrant colors, on a transparent background."
./generate_textures.sh "powerup_range" "$API_KEY"
sleep 2

echo "Generating speed power-up texture..."
TEXTURE_TYPE="powerup_speed"
PROMPT="A speed power-up item for a bomberman game, showing a lightning bolt inside a glowing orb. Pixel art style, vibrant colors, on a transparent background."
./generate_textures.sh "powerup_speed" "$API_KEY"
sleep 2

echo "Generating crystal texture..."
TEXTURE_TYPE="crystal"
PROMPT="A shiny crystal gem for a bomberman game, with faceted surfaces and internal glow. Pixel art style, vibrant colors, on a transparent background."
./generate_textures.sh "crystal" "$API_KEY"
sleep 2

echo "Generating barrel texture..."
TEXTURE_TYPE="barrel"
PROMPT="A wooden barrel texture for a bomberman game, round with metal bands. Pixel art style, top-down view, on a transparent background."
./generate_textures.sh "barrel" "$API_KEY"
sleep 2

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