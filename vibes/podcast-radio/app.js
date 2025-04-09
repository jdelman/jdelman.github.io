class PodcastRadio {
    constructor() {
        this.podcasts = [];
        this.currentPodcast = null;
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.opmlFileInput = document.getElementById('opmlFile');
        
        // Split display elements into current and loading
        this.currentPodcastDisplay = document.getElementById('currentPodcastName');
        this.currentEpisodeDisplay = document.getElementById('currentEpisodeTitle');
        this.loadingPodcastDisplay = document.getElementById('loadingPodcastName');
        this.loadingStatusDisplay = document.getElementById('loadingStatus');
        
        this.triedPodcasts = new Set();

        this.setupEventListeners();
        this.disableControls();
    }

    setupEventListeners() {
        this.opmlFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.nextBtn.addEventListener('click', () => this.playNextPodcast());
        this.audioPlayer.addEventListener('ended', () => this.playNextPodcast());
    }

    disableControls() {
        this.playPauseBtn.disabled = true;
        this.nextBtn.disabled = true;
    }

    enableControls() {
        this.playPauseBtn.disabled = false;
        this.nextBtn.disabled = false;
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            
            const outlines = xmlDoc.getElementsByTagName('outline');
            this.podcasts = Array.from(outlines)
                .filter(outline => outline.getAttribute('type') === 'rss')
                .map(outline => ({
                    title: outline.getAttribute('title') || outline.getAttribute('text'),
                    feedUrl: outline.getAttribute('xmlUrl')
                }));

            if (this.podcasts.length > 0) {
                this.enableControls();
                this.playNextPodcast();
            }
        } catch (error) {
            alert('Error parsing OPML file. Please make sure it\'s a valid OPML file.');
        }
    }

    async parsePodcastFeed(xmlContent) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
        
        const items = xmlDoc.getElementsByTagName('item');
        if (items.length === 0) throw new Error('No episodes found');

        const latestItem = items[0];
        const audioUrl = latestItem.getElementsByTagName('enclosure')[0]?.getAttribute('url');
        const title = latestItem.getElementsByTagName('title')[0]?.textContent;
        
        if (!audioUrl) throw new Error('No audio URL found');
        
        return { audioUrl, title };
    }

    async fetchPodcastFeed(feedUrl) {
        const response = await fetch(feedUrl);
        if (!response.ok) throw new Error('HTTP error');
        const text = await response.text();
        return await this.parsePodcastFeed(text);
    }

    updateLoadingStatus(podcastName, status) {
        this.loadingPodcastDisplay.textContent = podcastName || '';
        this.loadingStatusDisplay.textContent = status || '';
    }

    updateNowPlaying(podcastName, episodeTitle) {
        this.currentPodcastDisplay.textContent = podcastName;
        this.currentEpisodeDisplay.textContent = episodeTitle;
    }

    clearLoadingStatus() {
        this.updateLoadingStatus('', '');
    }

    async playNextPodcast() {
        if (this.podcasts.length === 0) return;

        // Reset if we've tried all podcasts
        if (this.triedPodcasts.size >= this.podcasts.length) {
            this.triedPodcasts.clear();
        }

        // Get available podcasts
        const availablePodcasts = this.podcasts.filter(p => !this.triedPodcasts.has(p.feedUrl));
        if (availablePodcasts.length === 0) {
            this.updateLoadingStatus('', 'All podcasts failed. Try again?');
            this.triedPodcasts.clear();
            return;
        }

        // Select random podcast
        const randomIndex = Math.floor(Math.random() * availablePodcasts.length);
        const selectedPodcast = availablePodcasts[randomIndex];
        this.triedPodcasts.add(selectedPodcast.feedUrl);

        // Update loading status
        this.updateLoadingStatus(selectedPodcast.title, 'Loading feed...');

        try {
            const episode = await this.fetchPodcastFeed(selectedPodcast.feedUrl);
            this.updateLoadingStatus(selectedPodcast.title, 'Loading audio...');
            
            this.audioPlayer.src = episode.audioUrl;

            // Set up promise for audio loading
            const audioLoaded = new Promise((resolve, reject) => {
                this.audioPlayer.addEventListener('loadedmetadata', () => {
                    resolve();
                }, { once: true });

                this.audioPlayer.onerror = () => {
                    reject(new Error('Audio failed to load'));
                };
            });

            await audioLoaded;

            // Only update the now playing display once audio is ready
            this.updateNowPlaying(selectedPodcast.title, episode.title);
            this.clearLoadingStatus();

            // Set random position and play
            const randomPosition = Math.random() * (this.audioPlayer.duration * 0.8);
            this.audioPlayer.currentTime = randomPosition;
            this.audioPlayer.play();
            this.playPauseBtn.textContent = 'Pause';

        } catch (error) {
            console.error('Failed to load podcast:', error);
            this.updateLoadingStatus(selectedPodcast.title, `Error: ${error.message}`);
            // Wait a brief moment so user can see the error
            setTimeout(() => this.playNextPodcast(), 500);
        }
    }

    togglePlayPause() {
        if (this.audioPlayer.paused) {
            this.audioPlayer.play();
            this.playPauseBtn.textContent = 'Pause';
        } else {
            this.audioPlayer.pause();
            this.playPauseBtn.textContent = 'Play';
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PodcastRadio();
}); 