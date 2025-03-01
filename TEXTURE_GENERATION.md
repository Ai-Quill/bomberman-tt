# Texture Generation for Bomberman Game

This document explains how to use the texture generation script to create new game assets using AI.

## Prerequisites

Before using the script, make sure you have the following installed:

1. **Python 3** - Required to run the script that calls the Replicate API
2. **Python packages**:
   - `replicate` - Will be installed automatically if missing
   - `requests` - Will be installed automatically if missing
3. **ImageMagick** - Required for image conversion and background removal
   - Install on macOS: `brew install imagemagick`
   - Install on Ubuntu: `sudo apt-get install imagemagick`
4. **Replicate API Token** - You'll need to provide your Replicate API token as a command-line parameter

## Using the Script

The script can generate different types of textures for the game. To use it:

```bash
./generate_textures.sh [texture_type] [api_key]
```

Where:
- `[texture_type]` is the type of texture to generate (see list below)
- `[api_key]` is your Replicate API token (starts with "r8_")

### Texture Types

- `player` - Generates a Bomberman player character
- `enemy` - Generates enemy characters
- `bomb` - Generates bomb textures
- `explosion` - Generates explosion effects
- `wall` - Generates solid wall textures
- `breakable` - Generates breakable wall/crate textures
- `powerup` - Generates power-up item textures

If no texture type is specified, a default generic game asset will be generated.

### Example

```bash
./generate_textures.sh player r8_your_api_key
```

This will generate player character textures and save them to `assets/textures/generated/`.

## Generating All Textures at Once

To generate all texture types in one go, use the batch script:

```bash
./generate_all_textures.sh [api_key]
```

For example:

```bash
./generate_all_textures.sh r8_your_api_key
```

This will generate all texture types and save them to the `assets/textures/generated/` directory.

## How It Works

1. The script generates a detailed prompt based on the texture type
2. It calls the Replicate API using the Hyper-Flux 8-step model to generate images
3. The generated images are saved as WebP files in the `temp_images` directory
4. The images are then converted to PNG format with transparent backgrounds
5. The final PNG files are saved in the `assets/textures/generated` directory

## Customizing Prompts

You can modify the prompts in the script to generate different styles of textures. The prompts are defined in the `generate_prompt()` function.

## Troubleshooting

If you encounter any issues:

1. Make sure your Replicate API token is valid
2. Check that you have Python 3 and the required packages installed
3. Ensure you have an internet connection to access the Replicate API
4. Check the console output for any error messages

## Output Files

The generated textures will be saved in the following locations:

- WebP files (original): `temp_images/[texture_type]_[index].webp`
- PNG files (processed): `assets/textures/generated/[texture_type]_[index].png`

The script will display the path to the generated files upon completion. 