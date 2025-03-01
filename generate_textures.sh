#!/bin/bash

# Script to generate game textures using Replicate API with Python
# Usage: ./generate_textures.sh [texture_type] [api_key]
# Example: ./generate_textures.sh player r8_your_api_key

# Check if API key is provided
if [ -z "$2" ]; then
    echo "Error: API key is required."
    echo "Usage: ./generate_textures.sh [texture_type] [api_key]"
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

# Function to generate a detailed prompt based on texture type
generate_prompt() {
    local type=$1
    local prompt=""
    
    case $type in
        "player")
            prompt="A cute cartoon bomberman character with a round body, wearing a blue and white outfit with a helmet, standing in a heroic pose. Pixel art style, vibrant colors, facing forward, on a transparent background."
            ;;
        "enemy")
            prompt="A menacing cartoon enemy character for a bomberman game, with angry eyes and a sinister smile. Pixel art style, vibrant colors, facing forward, on a transparent background."
            ;;
        "bomb")
            prompt="A classic round black bomb with a lit fuse on top, cartoon style. Pixel art style, vibrant colors, on a transparent background."
            ;;
        "explosion")
            prompt="A stylized cartoon explosion with bright orange and yellow flames radiating outward in a star pattern. Pixel art style, vibrant colors, on a transparent background."
            ;;
        "wall")
            prompt="A solid brick wall texture for a bomberman game, with detailed cracks and shading. Pixel art style, seamless pattern, on a transparent background."
            ;;
        "breakable")
            prompt="A wooden crate texture that looks breakable, with visible planks and nails. Pixel art style, seamless pattern, on a transparent background."
            ;;
        "powerup")
            prompt="A glowing power-up item for a bomberman game, spherical with a special symbol inside. Pixel art style, vibrant colors, on a transparent background."
            ;;
        *)
            prompt="A game asset for a bomberman-style game with vibrant colors and cartoon style. Pixel art style, on a transparent background."
            ;;
    esac
    
    echo "$prompt"
}

# Generate the prompt
PROMPT=$(generate_prompt "$TEXTURE_TYPE")
echo "Generating texture for: $TEXTURE_TYPE"
echo "Using prompt: $PROMPT"

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

print("Generating image with Replicate API...")

try:
    # Run the model
    output = replicate.run(
        "bytedance/hyper-flux-8step:81946b1e09b256c543b35f37333a30d0d02ee2cd8c4f77cd915873a1ca622bad",
        input={
            "prompt": prompt,
            "negative_prompt": "background, low quality, low resolution, blurry, text, watermark, signature, border",
            "width": 512,
            "height": 512,
            "num_inference_steps": 30,
            "guidance_scale": 7.5
        }
    )
    
    print("Image generation complete!")
    
    # Save all generated images
    for index, image_url in enumerate(output):
        filename = f"temp_images/{texture_type}_{index}.webp"
        print(f"Saving {filename}...")
        
        # Download the image
        response = requests.get(image_url)
        if response.status_code == 200:
            with open(filename, "wb") as f:
                f.write(response.content)
            print(f"Successfully saved {filename}")
        else:
            print(f"Failed to download image: {response.status_code}")
    
    print("All images saved successfully!")

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
        
        # Convert webp to png and remove background
        convert "$webp_file" -transparent white "$output_file"
        
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