#!/bin/bash

# Script to generate game textures using Replicate API with Python
# Usage: ./generate_textures.sh [texture_type] [api_key] [custom_prompt] [variation_count]
# Example: ./generate_textures.sh player r8_your_api_key "A custom prompt" 3

# Check if API key is provided
if [ -z "$2" ]; then
    echo "Error: API key is required."
    echo "Usage: ./generate_textures.sh [texture_type] [api_key] [custom_prompt] [variation_count]"
    echo "Example: ./generate_textures.sh player r8_your_api_key"
    exit 1
fi

# Set API token from command line
export REPLICATE_API_TOKEN="$2"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 to use this script."
    exit 1
fi

# Check if required packages are installed
if ! python3 -c "import replicate" &> /dev/null; then
    echo "Installing Python replicate package..."
    pip3 install replicate
fi

if ! python3 -c "import requests" &> /dev/null; then
    echo "Installing Python requests package..."
    pip3 install requests
fi

if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install ImageMagick for image conversion."
    echo "On macOS: brew install imagemagick"
    echo "On Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# Create output directories if they don't exist
mkdir -p assets/textures/generated
mkdir -p temp_images

# Get texture type from command line argument
TEXTURE_TYPE=${1:-"default"}

# Get variation count (default to 1 if not specified)
VARIATION_COUNT=${4:-1}

# Check if a custom prompt is provided
if [ -n "$3" ]; then
    PROMPT="$3"
    echo "Using custom prompt: $PROMPT"
else
    # Function to generate a detailed prompt based on texture type
    generate_prompt() {
        local type=$1
        local prompt=""
        
        case $type in
            "player")
                prompt="A cute cartoon bomberman character with a round body, wearing a blue and white outfit with a helmet, standing in a heroic pose. Pixel art style, vibrant colors, facing forward, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "player_alt")
                prompt="An alternative bomberman character with a red and white outfit, with a determined expression. Pixel art style, vibrant colors, facing forward, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "player_girl")
                prompt="A female bomberman character with pink and white outfit, with a cute expression and ponytail. Pixel art style, vibrant colors, facing forward, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "enemy")
                prompt="A menacing cartoon enemy character for a bomberman game, with angry eyes and a sinister smile. Pixel art style, vibrant colors, facing forward, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "enemy_red")
                prompt="A menacing red cartoon enemy character for a bomberman game, with angry eyes and a sinister smile. Pixel art style, vibrant red color scheme, facing forward, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "enemy_blue")
                prompt="A menacing blue cartoon enemy character for a bomberman game, with angry eyes and a sinister smile. Pixel art style, vibrant blue color scheme, facing forward, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "enemy_green")
                prompt="A menacing green cartoon enemy character for a bomberman game, with angry eyes and a sinister smile. Pixel art style, vibrant green color scheme, facing forward, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "enemy_boss")
                prompt="A large boss enemy for a bomberman game, with multiple eyes and a menacing appearance. Pixel art style, vibrant colors, facing forward, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "bomb")
                prompt="A classic round black bomb with a lit fuse on top, cartoon style. Pixel art style, vibrant colors, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "bomb_alt")
                prompt="An alternative bomb design with a digital timer display and blinking lights. Pixel art style, vibrant colors, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "explosion")
                prompt="A stylized cartoon explosion with bright orange and yellow flames radiating outward in a star pattern. Pixel art style, vibrant colors, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "explosion_blue")
                prompt="A stylized blue energy explosion with electric effects radiating outward. Pixel art style, vibrant colors, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "wall")
                prompt="A solid brick wall texture for a bomberman game, with detailed cracks and shading. Pixel art style, seamless pattern, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "wall_stone")
                prompt="A stone wall texture with moss and weathered appearance for a bomberman game. Pixel art style, seamless pattern, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "breakable")
                prompt="A wooden crate texture that looks breakable, with visible planks and nails. Pixel art style, seamless pattern, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "metal_crate")
                prompt="A metallic crate with rivets and worn edges, industrial style. Pixel art style, seamless pattern, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "ice_block")
                prompt="A translucent ice block with crystalline structure and subtle blue tint. Pixel art style, seamless pattern, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "powerup")
                prompt="A glowing power-up item for a bomberman game, spherical with a special symbol inside. Pixel art style, vibrant colors, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "powerup_bomb")
                prompt="A bomb power-up item for a bomberman game, showing a small bomb icon inside a glowing orb. Pixel art style, vibrant colors, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "powerup_range")
                prompt="A range power-up item for a bomberman game, showing expanding arrows inside a glowing orb. Pixel art style, vibrant colors, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "powerup_speed")
                prompt="A speed power-up item for a bomberman game, showing a lightning bolt inside a glowing orb. Pixel art style, vibrant colors, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "powerup_life")
                prompt="A life power-up item for a bomberman game, showing a heart symbol inside a glowing orb. Pixel art style, vibrant colors, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "powerup_shield")
                prompt="A shield power-up item for a bomberman game, showing a shield symbol inside a glowing orb. Pixel art style, vibrant colors, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "floor")
                prompt="A seamless floor texture for a bomberman game, with subtle patterns. Pixel art style, top-down view, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "floor_ice")
                prompt="A seamless ice floor texture for a bomberman game, with light blue color and subtle cracks. Pixel art style, top-down view, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "floor_sand")
                prompt="A seamless sand floor texture for a bomberman game, with light tan color and subtle grain patterns. Pixel art style, top-down view, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "floor_lava")
                prompt="A seamless lava floor texture for a bomberman game, with bright orange and red colors and bubbling effects. Pixel art style, top-down view, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "crystal")
                prompt="A shiny crystal gem for a bomberman game, with faceted surfaces and internal glow. Pixel art style, vibrant colors, completely isolated on pure transparent background, no shadows or effects."
                ;;
            "barrel")
                prompt="A wooden barrel texture for a bomberman game, round with metal bands. Pixel art style, top-down view, completely isolated on pure transparent background, no shadows or effects."
                ;;
            *)
                prompt="A game asset for a bomberman-style game with vibrant colors and cartoon style. Pixel art style, completely isolated on pure transparent background, no shadows or effects."
                ;;
        esac
        
        echo "$prompt"
    }

    # Generate the prompt
    PROMPT=$(generate_prompt "$TEXTURE_TYPE")
    echo "Generating texture for: $TEXTURE_TYPE"
    echo "Using prompt: $PROMPT"
fi

# Create a temporary Python script to call the Replicate API
cat > temp_generate.py << EOF
import os
import sys
import replicate
import requests
from pathlib import Path

# Ensure the temp_images directory exists
Path("temp_images").mkdir(exist_ok=True)

# Get the API token from environment variable
api_token = os.environ.get("REPLICATE_API_TOKEN")
if not api_token:
    print("Error: REPLICATE_API_TOKEN environment variable not set")
    sys.exit(1)

# Set up the prompt and parameters
texture_type = "$TEXTURE_TYPE"
prompt = "$PROMPT"
variation_count = $VARIATION_COUNT

print(f"Generating {variation_count} variations with Replicate API...")

try:
    # Run the model for each variation
    for variation in range(variation_count):
        print(f"Generating variation {variation+1}/{variation_count}...")
        
        # Run the model
        output = replicate.run(
            "bytedance/hyper-flux-8step:81946b1e09b256c543b35f37333a30d0d02ee2cd8c4f77cd915873a1ca622bad",
            input={
                "prompt": prompt,
                "negative_prompt": "background, low quality, low resolution, blurry, text, watermark, signature, border",
                "width": 512,
                "height": 512,
                "num_inference_steps": 30,
                "guidance_scale": 7.5,
                "seed": variation * 1000  # Use different seed for each variation
            }
        )
        
        print(f"Variation {variation+1} generation complete!")
        
        # Save all generated images for this variation
        for index, image_url in enumerate(output):
            filename = f"temp_images/{texture_type}_var{variation}_{index}.webp"
            print(f"Saving {filename}...")
            
            # Download the image
            response = requests.get(image_url)
            if response.status_code == 200:
                with open(filename, "wb") as f:
                    f.write(response.content)
                print(f"Successfully saved {filename}")
            else:
                print(f"Failed to download image: {response.status_code}")
    
    print("All variations generated successfully!")

except Exception as e:
    print(f"Error generating image: {e}")
    sys.exit(1)
EOF

# Run the Python script
echo "Calling Replicate API to generate images..."
python3 temp_generate.py

# Process the images: remove background and convert to PNG
echo "Processing images..."
for webp_file in temp_images/${TEXTURE_TYPE}_*.webp; do
    if [ -f "$webp_file" ]; then
        filename=$(basename -- "$webp_file")
        filename_noext="${filename%.*}"
        output_file="assets/textures/generated/${filename_noext}.png"
        
        echo "Converting $webp_file to $output_file..."
        
        # Enhanced background removal and conversion process
        convert "$webp_file" \
            -fuzz 5% \
            -transparent white \
            -fill none \
            -draw "color 0,0 floodfill" \
            -channel alpha \
            -blur 0x0.5 \
            -level 50%,100% \
            "$output_file"
        
        echo "Created $output_file"
    fi
done

# Clean up temporary files
echo "Cleaning up temporary files..."
rm temp_generate.py
# Uncomment the line below if you want to remove the temporary webp files
# rm -rf temp_images

echo "Texture generation complete! Files saved to assets/textures/generated/"
echo "Generated textures for: $TEXTURE_TYPE"
ls -la assets/textures/generated/${TEXTURE_TYPE}_*

# Make the script executable
chmod +x generate_textures.sh 