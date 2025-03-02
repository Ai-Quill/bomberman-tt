class SoundManager {
    constructor() {
        try {
            console.log('Initializing SoundManager...');
            
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isMuted = false;
            this.sounds = {};
            
            // Create master gain node for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 1.0;
            this.masterGain.connect(this.audioContext.destination);
            
            // Background music source
            this.bgMusicSource = null;
            
            console.log('Sound manager initialized with Web Audio API');
            
            // Check if audio context is in suspended state (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                console.warn('AudioContext is suspended. User interaction required to resume audio playback.');
                this.showAudioMessage();
            }
            
            // Load sound effects
            this.loadSounds();
        } catch (error) {
            console.error('Error initializing SoundManager:', error);
            this.audioContext = null;
            this.isMuted = true;
            this.sounds = {};
            this.masterGain = null;
            
            // Create a fallback message
            this.showAudioMessage('Audio initialization failed: ' + error.message);
        }
    }
    
    // Show a message about audio state
    showAudioMessage(message) {
        // Only show if updateLoadingProgress is available
        if (typeof window.updateLoadingProgress === 'function') {
            if (message) {
                window.updateLoadingProgress(message);
            } else {
                window.updateLoadingProgress('Audio is ready but requires user interaction to play');
            }
        }
    }
    
    toggleMute() {
        try {
            this.isMuted = !this.isMuted;
            console.log('Sound muted:', this.isMuted);
            
            if (!this.audioContext || !this.masterGain) {
                console.warn('Audio context or master gain not available');
                return;
            }
            
            if (this.isMuted) {
                // Mute sound
                this.masterGain.gain.value = 0;
                if (this.bgMusicSource) {
                    try {
                        this.bgMusicSource.stop();
                    } catch (e) {
                        console.warn('Error stopping background music:', e);
                    }
                    this.bgMusicSource = null;
                }
            } else {
                // Unmute sound
                this.masterGain.gain.value = 1.0;
                this.play('bgMusic');
                
                // Resume audio context if it's suspended
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume().then(() => {
                        console.log('AudioContext resumed successfully');
                    }).catch(err => {
                        console.error('Failed to resume AudioContext:', err);
                    });
                }
            }
        } catch (error) {
            console.error('Error in toggleMute:', error);
        }
    }
    
    // Play a sound by type
    play(soundType) {
        try {
            if (this.isMuted || !this.audioContext) {
                console.log(`Sound ${soundType} not played because sound is muted or unavailable`);
                return;
            }
            
            // Resume audio context if it's suspended (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                console.log('Attempting to resume AudioContext...');
                this.audioContext.resume().then(() => {
                    console.log('AudioContext resumed successfully');
                    this.playSound(soundType);
                }).catch(err => {
                    console.error('Failed to resume AudioContext:', err);
                    this.showAudioMessage('Failed to resume audio: ' + err.message);
                });
            } else {
                this.playSound(soundType);
            }
        } catch (error) {
            console.error(`Error playing sound ${soundType}:`, error);
        }
    }
    
    // Internal method to play the actual sound
    playSound(soundType) {
        try {
            console.log(`Playing sound: ${soundType}`);
            
            switch (soundType) {
                case 'bgMusic':
                    this.playBackgroundMusic();
                    break;
                case 'playerMove':
                    this.loadAndPlayAudio('assets/sounds/player_footstep.mp3', false, 0.3);
                    break;
                case 'playerHit':
                    this.loadAndPlayAudio('assets/sounds/player_death.mp3', false, 0.3);
                    break;
                case 'playerDeath':
                    this.loadAndPlayAudio('assets/sounds/player_death.mp3', false, 0.7);
                    break;
                case 'bombPlace':
                    this.loadAndPlayAudio('assets/sounds/bomb_place.mp3', false, 0.4);
                    break;
                case 'bombExplode':
                    this.loadAndPlayAudio('assets/sounds/bomb_explosion.mp3', false, 0.7);
                    break;
                case 'powerUp':
                    this.loadAndPlayAudio('assets/sounds/powerup_collect.mp3', false, 0.5);
                    break;
                case 'enemyDeath':
                    this.loadAndPlayAudio('assets/sounds/enemy_death.mp3', false, 0.5);
                    break;
                case 'levelComplete':
                    this.loadAndPlayAudio('assets/sounds/level_complete.mp3', false, 0.7);
                    break;
                case 'gameOver':
                    this.loadAndPlayAudio('assets/sounds/game_over.mp3', false, 0.7);
                    break;
                default:
                    console.warn(`Unknown sound type: ${soundType}`);
            }
        } catch (error) {
            console.error(`Error in playSound ${soundType}:`, error);
        }
    }
    
    // Play background music
    playBackgroundMusic() {
        try {
            if (this.isMuted || !this.audioContext) return;
            
            if (this.bgMusicSource) {
                // Already playing
                return;
            }
            
            console.log('Starting background music');
            
            // Load and play the background music file
            this.loadAndPlayAudio('assets/sounds/background_rhythm_guitar.mp3', true, 0.5);
        } catch (error) {
            console.error('Error playing background music:', error);
        }
    }
    
    // Load and play an audio file
    loadAndPlayAudio(url, loop = false, volume = 1.0) {
        try {
            if (this.isMuted || !this.audioContext) return;
            
            console.log(`Loading audio: ${url}, loop: ${loop}, volume: ${volume}`);
            
            // Check if we already have this sound cached
            if (this.sounds[url]) {
                this.playFromBuffer(this.sounds[url], loop, volume);
                return;
            }
            
            // Create a new audio buffer source
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => {
                    if (!this.audioContext) {
                        throw new Error('Audio context is not available');
                    }
                    return this.audioContext.decodeAudioData(arrayBuffer);
                })
                .then(audioBuffer => {
                    // Cache the decoded buffer
                    this.sounds[url] = audioBuffer;
                    
                    // Play the sound
                    this.playFromBuffer(audioBuffer, loop, volume);
                })
                .catch(error => {
                    console.error(`Error loading audio ${url}:`, error);
                });
        } catch (error) {
            console.error(`Error in loadAndPlayAudio for ${url}:`, error);
        }
    }

    // Stop background music
    stopBackgroundMusic() {
        try {
            if (this.bgMusicSource) {
                console.log('Stopping background music');
                try {
                    this.bgMusicSource.stop();
                } catch (e) {
                    console.warn('Error stopping background music:', e);
                }
                this.bgMusicSource = null;
            }
        } catch (error) {
            console.error('Error in stopBackgroundMusic:', error);
        }
    }

    // Play from an audio buffer
    playFromBuffer(audioBuffer, loop = false, volume = 1.0) {
        try {
            if (!this.audioContext || !this.masterGain) {
                console.warn('Cannot play sound: audio context or master gain not available');
                return;
            }
            
            // Create a source node
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = loop;
            
            // Create a gain node for volume control
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume;
            
            // Connect the source to the gain node and the gain node to the master gain
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Store the source if it's background music
            if (loop) {
                this.bgMusicSource = source;
            }
            
            // Start playing
            source.start();
            console.log(`Playing audio buffer, loop: ${loop}, volume: ${volume}`);
            
            // Set up cleanup when the audio ends (if not looping)
            if (!loop) {
                source.onended = () => {
                    console.log('Audio playback ended');
                };
            }
            
            return source;
        } catch (error) {
            console.error('Error in playFromBuffer:', error);
            return null;
        }
    }
    
    // Load all sounds
    loadSounds() {
        try {
            if (!this.audioContext) {
                console.warn('Cannot load sounds: audio context not available');
                return;
            }
            
            const soundsToPreload = [
                'assets/sounds/player_footstep.mp3',
                'assets/sounds/player_death.mp3',
                'assets/sounds/bomb_place.mp3',
                'assets/sounds/bomb_explosion.mp3',
                'assets/sounds/powerup_collect.mp3',
                'assets/sounds/enemy_death.mp3',
                'assets/sounds/level_complete.mp3',
                'assets/sounds/game_over.mp3',
                'assets/sounds/background_rhythm_guitar.mp3'
            ];
            
            console.log('Preloading sounds...');
            
            soundsToPreload.forEach(url => {
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.arrayBuffer();
                    })
                    .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                    .then(audioBuffer => {
                        this.sounds[url] = audioBuffer;
                        console.log(`Preloaded sound: ${url}`);
                    })
                    .catch(error => {
                        console.warn(`Error preloading sound ${url}:`, error);
                    });
            });
        } catch (error) {
            console.error('Error in loadSounds:', error);
        }
    }
}

export default SoundManager; 