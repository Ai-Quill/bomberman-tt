# Sound Assets for Bomberman Game

This directory contains sound assets for the Bomberman game. The following files are used for various game actions and background music.

## Required Sound Files

### Background Music Tracks

For the rock and roll background music, you need to provide the following audio files:

1. `background_drums.mp3` - Rock drum beat track
2. `background_bass.mp3` - Bass guitar line
3. `background_rhythm_guitar.mp3` - Rhythm guitar riff
4. `background_lead_guitar.mp3` - Lead guitar melody

### Game Action Sounds

The following sound files are used for various game actions:

1. `player_footstep.mp3` - Played when the player moves
2. `bomb_place.mp3` - Played when placing a bomb
3. `bomb_explosion.mp3` - Played when a bomb explodes
4. `powerup_collect.mp3` - Played when collecting a power-up
5. `enemy_death.mp3` - Played when an enemy is defeated
6. `level_complete.mp3` - Played when completing a level
7. `player_death.mp3` - Played when the player dies
8. `game_over.mp3` - Played when the game is over

## Downloading Sounds from Pixabay

You can find free sound effects on [Pixabay](https://pixabay.com/sound-effects/). Follow these steps to download sounds:

1. Visit [Pixabay Sound Effects](https://pixabay.com/sound-effects/)
2. Search for each sound type (e.g., "explosion sound effect", "footstep sound")
3. Listen to the sounds to find one that fits your game
4. Click the "Download" button to download the MP3 file
5. Rename the downloaded file to match the required filename (e.g., `bomb_explosion.mp3`)
6. Place the file in this directory

### Recommended Search Terms for Pixabay

For best results, try these search terms:

- For `background_drums.mp3`: "rock drums beat loop"
- For `background_bass.mp3`: "rock bass guitar loop"
- For `background_rhythm_guitar.mp3`: "rock rhythm guitar loop"
- For `background_lead_guitar.mp3`: "rock lead guitar melody loop"
- For `player_footstep.mp3`: "footstep sound effect"
- For `bomb_place.mp3`: "place object sound effect"
- For `bomb_explosion.mp3`: "explosion sound effect"
- For `powerup_collect.mp3`: "power up collect sound"
- For `enemy_death.mp3`: "enemy defeat sound"
- For `level_complete.mp3`: "level complete jingle"
- For `player_death.mp3`: "game character death sound"
- For `game_over.mp3`: "game over sound effect"

## Creating Placeholder Files

You can use the included `create_placeholder_sounds.sh` script to create empty placeholder files with the correct names. Run it from the terminal:

```bash
./create_placeholder_sounds.sh
```

## Fallback Behavior

If any of these audio files are missing or cannot be loaded, the game will generate fallback sounds using the Web Audio API. However, these generated sounds will not sound as good as properly recorded audio files.

## Recommended Specifications

For the best experience, the audio files should:
- Be in MP3 format (other formats like OGG or WAV may also work)
- Have appropriate durations:
  - Background music: 8-16 seconds each, designed to loop seamlessly
  - Sound effects: Short (0.5-2 seconds) with quick attack
- Be mixed to appropriate volumes
- Have clear, distinctive sounds that match the action 