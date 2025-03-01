# Using Generated Textures in Your Game

This document explains how to use the generated textures in your game.

## Overview

The texture generation process creates files with names like `player_0.png`, `enemy_0.png`, etc. in the `assets/textures/generated` directory. However, the game expects files with specific names like `player.png`, `enemy_red.png`, etc. in the `assets/textures` directory.

The `copy_textures.sh` script automates the process of copying and renaming the generated textures to match the expected file names.

## Using the Copy Script

After generating textures with the `generate_textures.sh` or `generate_all_textures.sh` scripts, run the copy script:

```bash
./copy_textures.sh
```

This script will:

1. Back up your original textures to `assets/textures/original_backup/`
2. Copy the generated textures to the correct locations with the correct names
3. Provide instructions on how to revert to the original textures if needed

## Texture Mapping

The script maps the generated textures to the game's expected textures as follows:

| Generated Texture | Game Textures |
|-------------------|---------------|
| player_0.png | player.png |
| enemy_red_0.png | enemy_red.png |
| enemy_blue_0.png | enemy_blue.png |
| enemy_green_0.png | enemy_green.png |
| bomb_0.png | bomb.png |
| explosion_0.png | explosion.png |
| wall_0.png | wall.png |
| breakable_0.png | crate.png |
| barrel_0.png | barrel.png |
| floor_0.png | floor.png |
| floor_ice_0.png | floor_ice.png |
| floor_sand_0.png | floor_sand.png |
| power-up_bomb_0.png | power-up_bomb.png |
| power-up_range_0.png | power-up_range.png |
| power-up_speed_0.png | power-up_speed.png |
| crystal_0.png | crystal.png |

## Reverting to Original Textures

If you want to revert to the original textures, run:

```bash
cp assets/textures/original_backup/*.png assets/textures/
```

This will restore all the original textures from the backup.

## Generating a Complete Set of Textures

To generate a complete set of textures for your game, use the `generate_all_textures.sh` script:

```bash
./generate_all_textures.sh [api_key]
```

This will generate all the texture types needed for the game, including:
- Player character
- Different colored enemies
- Bombs and explosions
- Walls and breakable objects
- Floor types (regular, ice, sand)
- Power-up items

After generating the textures, run the copy script to apply them to your game:

```bash
./copy_textures.sh
```

## Customizing Textures

If you want to generate a specific texture type with a custom prompt, you can use:

```bash
./generate_textures.sh [texture_type] [api_key] "Your custom prompt here"
```

For example:
```bash
./generate_textures.sh player r8_your_api_key "A blue robot character with glowing eyes, pixel art style"
```

## Troubleshooting

If the textures don't appear correctly in the game:

1. Check that the files have been copied to the correct location
2. Ensure the PNG files have transparency (the background should be transparent)
3. Try refreshing the game's cache or restarting the game
4. If all else fails, revert to the original textures using the command above 