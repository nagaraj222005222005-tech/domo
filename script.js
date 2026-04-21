// ============================================
// MUSIC PLAYER CONTROLLER
// ============================================

class MusicPlayer {
    constructor() {
        // Player Elements
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.querySelector('.progress-bar-container');
        this.progressFill = document.querySelector('.progress-fill');
        this.progressDot = document.querySelector('.progress-dot');
        this.currentTimeEl = document.querySelector('.current-time');
        this.totalTimeEl = document.querySelector('.total-time');
        this.albumArtwork = document.querySelector('.album-rotating');
        this.songTitle = document.querySelector('.song-title');
        this.songArtist = document.querySelector('.song-artist');
        this.musicPlayer = document.querySelector('.music-player');
        this.themeBtn = document.getElementById('themeBtn');
        this.volumeSlider = document.querySelector('.volume-slider');

        // State
        this.isPlaying = false;
        this.currentTime = 0;
        this.totalTime = 225; // 3:45 in seconds
        this.currentAlbumIndex = 0;
        this.animationFrameId = null;
        this.isLight = false;

        // Albums Data
        this.albums = [
            { title: 'Neon Dreams', artist: 'Synthwave Master', duration: 225, gradient: 'gradient-1' },
            { title: 'Cyber Pulse', artist: 'Digital Echo', duration: 240, gradient: 'gradient-2' },
            { title: 'Midnight Code', artist: 'Lunar Sound', duration: 210, gradient: 'gradient-3' },
            { title: 'Electric Storm', artist: 'Voltage Wave', duration: 200, gradient: 'gradient-4' },
            { title: 'Crystal Nights', artist: 'Aurora Vibes', duration: 235, gradient: 'gradient-5' },
            { title: 'Pixel Paradise', artist: 'Retro Future', duration: 220, gradient: 'gradient-6' },
        ];

        this.initEventListeners();
        this.loadTheme();
    }

    initEventListeners() {
        // Player Controls
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());

        // Progress Bar
        this.progressBar.addEventListener('click', (e) => this.seek(e));

        // Album Cards
        document.querySelectorAll('.album-card').forEach((card, index) => {
            card.addEventListener('click', () => this.loadAlbum(index));
            card.querySelector('.play-btn-album').addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadAlbum(index);
                this.play();
            });
        });

        // Theme Toggle
        this.themeBtn.addEventListener('click', () => this.toggleTheme());

        // Sidebar Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Volume Control
        this.volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        this.playBtn.classList.add('playing');
        this.musicPlayer.classList.add('playing');
        this.albumArtwork.classList.remove('paused');
        this.startPlaybackAnimation();
    }

    pause() {
        this.isPlaying = false;
        this.playBtn.classList.remove('playing');
        this.musicPlayer.classList.remove('playing');
        this.albumArtwork.classList.add('paused');
        this.stopPlaybackAnimation();
    }

    startPlaybackAnimation() {
        const animate = () => {
            if (this.isPlaying) {
                this.currentTime += 0.016; // ~60fps

                if (this.currentTime >= this.totalTime) {
                    this.nextTrack();
                    return;
                }

                this.updateProgressBar();
                this.animationFrameId = requestAnimationFrame(animate);
            }
        };
        animate();
    }

    stopPlaybackAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    updateProgressBar() {
        const percentage = (this.currentTime / this.totalTime) * 100;
        this.progressFill.style.width = percentage + '%';
        this.progressDot.style.left = percentage + '%';

        // Update time display
        this.currentTimeEl.textContent = this.formatTime(this.currentTime);
        this.totalTimeEl.textContent = this.formatTime(this.totalTime);
    }

    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.currentTime = percent * this.totalTime;
        this.updateProgressBar();
    }

    nextTrack() {
        this.currentAlbumIndex = (this.currentAlbumIndex + 1) % this.albums.length;
        this.loadAlbum(this.currentAlbumIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    previousTrack() {
        this.currentAlbumIndex = (this.currentAlbumIndex - 1 + this.albums.length) % this.albums.length;
        this.loadAlbum(this.currentAlbumIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    loadAlbum(index) {
        this.currentAlbumIndex = index;
        const album = this.albums[index];

        // Update player info
        this.songTitle.textContent = album.title;
        this.songArtist.textContent = album.artist;
        this.totalTime = album.duration;

        // Update album artwork
        this.albumArtwork.className = 'album-rotating ' + album.gradient;

        // Update progress bar
        this.currentTime = 0;
        this.updateProgressBar();

        // Highlight album card
        document.querySelectorAll('.album-card').forEach((card, i) => {
            if (i === index) {
                card.style.borderColor = 'var(--color-primary)';
                card.style.boxShadow = '0 15px 40px rgba(0, 217, 255, 0.3), 0 0 30px rgba(255, 0, 255, 0.1)';
            } else {
                card.style.borderColor = 'rgba(0, 217, 255, 0.2)';
                card.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            }
        });
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    toggleTheme() {
        this.isLight = !this.isLight;
        document.body.classList.toggle('light-theme', this.isLight);
        this.themeBtn.textContent = this.isLight ? '☀️' : '🌙';
        localStorage.setItem('theme', this.isLight ? 'light' : 'dark');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            this.isLight = true;
            document.body.classList.add('light-theme');
            this.themeBtn.textContent = '☀️';
        }
    }

    setVolume(value) {
        // Visual feedback for volume - could be extended with audio API
        const percent = value / 100;
        if (percent < 0.3) {
            this.volumeSlider.parentElement.querySelector('.volume-icon').textContent = '🔇';
        } else if (percent < 0.7) {
            this.volumeSlider.parentElement.querySelector('.volume-icon').textContent = '🔉';
        } else {
            this.volumeSlider.parentElement.querySelector('.volume-icon').textContent = '🔊';
        }
    }
}

// ============================================
// INITIALIZE PLAYER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const player = new MusicPlayer();
    
    // Load the first album by default
    player.loadAlbum(0);
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // These would work if we had a global player reference
    if (e.code === 'Space') {
        e.preventDefault();
        // Play/Pause
    }
});
