# Using Generated Textures in Your Game

This document explains how to use the generated textures in your Bomberman game.

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
| enemy_0.png | enemy_red.png, enemy_blue.png, enemy_green.png |
| bomb_0.png | bomb.png |
| explosion_0.png | explosion.png |
| wall_0.png | wall.png |
| breakable_0.png | crate.png, barrel.png |
| powerup_0.png | powerup_bomb.png, powerup_range.png, powerup_speed.png, crystal.png |

## Reverting to Original Textures

If you want to revert to the original textures, run:

```bash
cp assets/textures/original_backup/*.png assets/textures/
```

This will restore all the original textures from the backup.

## Customizing Textures

If you want to use different generated textures for different game elements (e.g., different enemy types), you can:

1. Generate multiple textures of the same type (e.g., run `./generate_textures.sh enemy` multiple times)
2. Manually copy and rename the generated files to match the expected names

For example:
```bash
cp assets/textures/generated/enemy_0.png assets/textures/enemy_red.png
cp assets/textures/generated/enemy_1.png assets/textures/enemy_blue.png
cp assets/textures/generated/enemy_2.png assets/textures/enemy_green.png
```

## Troubleshooting

If the textures don't appear correctly in the game:

1. Check that the files have been copied to the correct location
2. Ensure the PNG files have transparency (the background should be transparent)
3. Try refreshing the game's cache or restarting the game
4. If all else fails, revert to the original textures using the command above 