const greeting = document.querySelector('.greeting');



window.onload = () => {
  
    if (!sessionStorage.name) {
        location.href = '/login';
    } else {
        const currentHour = new Date().getHours();
        let greetingMessage;

        if (currentHour < 12) {
            greetingMessage = `Good morning, ${sessionStorage.name}.`;
        } else if (currentHour < 18) {
            greetingMessage = `Good afternoon, ${sessionStorage.name}.`;
        } else {
            greetingMessage = `Good evening, ${sessionStorage.name}.`;
        }

        greeting.innerHTML = greetingMessage;

        
    }
}





//username displayed on the webpage
const username1 = document.querySelector('.right');
usernameDisplay = `${sessionStorage.name}`; 
username1.innerHTML = usernameDisplay;

//music player
const image = document.getElementById('cover'),
    title = document.getElementById('music-title'),
    artist = document.getElementById('music-artist'),
    currentTimeEl = document.getElementById('current-time'),
    durationEl = document.getElementById('duration'),
    progress = document.getElementById('progress'),
    playerProgress = document.getElementById('player-progress'),
    prevBtn = document.getElementById('prev'),
    nextBtn = document.getElementById('next'),
    playBtn = document.getElementById('play'),
    background = document.getElementById('bg-img');

const music = new Audio();

const adTrack = {
    preview_url: 'assets/The North Face - Never stop exploring - 2014.mp3',
    name: 'Never Stop Exploring',
    album: {
        images: [{ url: 'assets/neversstopexploring.png' }]
    },
    artists: [{ name: 'Advertisement' }],
    isAd: true,
    unskippable: true
};

let currentTrackIndex = -1; // Set to -1 to indicate no track is currently loaded
let isPlaying = false;
let skipCounter = 0;
let currentPlaylist = [adTrack]; // Start with just the ad in the playlist

function initializePlayer() {
    // Set default values
    title.textContent = 'Welcome to Your Music Player';
    artist.textContent = 'Search for a track to begin';
    image.src = 'assets/maxresdefault.png';
    music.src = ''; // No audio source initially

    // Disable controls initially
    playBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
}

// Call this function when the page loads
window.addEventListener('load', initializePlayer);

function togglePlay() {
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    isPlaying = true;
    // Change play button icon
    playBtn.classList.replace('fa-play', 'fa-pause');
    // Set button hover title
    playBtn.setAttribute('title', 'Pause');
    music.play();
}

function pauseMusic() {
    isPlaying = false;
    // Change pause button icon
    playBtn.classList.replace('fa-pause', 'fa-play');
    // Set button hover title
    playBtn.setAttribute('title', 'Play');
    music.pause();
}

function loadMusic(track) {
    if (!track) return;

    music.src = track.preview_url;
    title.textContent = track.name;
    artist.textContent = track.artists.map(a => a.name).join(', ');
    image.src = track.album.images[0].url;

    prevBtn.disabled = track.unskippable || currentPlaylist.length <= 1;
    nextBtn.disabled = track.unskippable || currentPlaylist.length <= 1;
    playBtn.disabled = false;
}

function changeMusic(direction) {
    skipCounter++;
    
    if (skipCounter === 2) {
        currentTrackIndex = 0; // Play the ad
        skipCounter = 0; // Reset the counter
    } else {
        currentTrackIndex = (currentTrackIndex + direction + currentPlaylist.length) % currentPlaylist.length;
    }
    
    loadMusic(currentPlaylist[currentTrackIndex]);
    playMusic();
}

function updateProgressBar() {
    const { duration, currentTime } = music;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;

    const formatTime = (time) => String(Math.floor(time)).padStart(2, '0');
    durationEl.textContent = `${formatTime(duration / 60)}:${formatTime(duration % 60)}`;
    currentTimeEl.textContent = `${formatTime(currentTime / 60)}:${formatTime(currentTime % 60)}`;
}

function setProgressBar(e) {
    const width = playerProgress.clientWidth;
    const clickX = e.offsetX;
    music.currentTime = (clickX / width) * music.duration;
}

playBtn.addEventListener('click', () => {
    if (currentTrackIndex === -1) {
        // If no track is loaded, start with the first track in the playlist
        currentTrackIndex = 0;
        loadMusic(currentPlaylist[currentTrackIndex]);
    }
    togglePlay();
});

prevBtn.addEventListener('click', () => {
    if (currentTrackIndex > 0 && !currentPlaylist[currentTrackIndex].unskippable) {
        changeMusic(-1);
    }
});

nextBtn.addEventListener('click', () => {
    if (currentTrackIndex < currentPlaylist.length - 1 && !currentPlaylist[currentTrackIndex].unskippable) {
        changeMusic(1);
    }
});

music.addEventListener('ended', () => {
    if (currentTrackIndex === 0) {
        skipCounter = 0; // Reset skip counter when the ad ends
    }
    changeMusic(1);
});
music.addEventListener('timeupdate', updateProgressBar);
playerProgress.addEventListener('click', setProgressBar);

// Initialize with the ad
loadMusic(adTrack);




document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('searchQuery'); // Your search input
  const resultsDiv = document.getElementById('results');
  const spinner = document.getElementById('spinner');
  const errorMessage = document.getElementById('error-message');
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');
  const paginationControls = document.getElementById('pagination-controls'); // Pagination control

  const mainContent = document.getElementById('main-content'); // Main content to hide
  const searchResults = document.getElementById('searchResults'); // Search results to show

  let tracks = [];
  let token = null;
  let resultOffset = 0;
  let keyword = '';

  // Initialize the app by getting the Spotify token
  async function fetchToken() {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials&client_id=a77073181b7d48eb90003e3bb94ff88a&client_secret=68790982a0554d1a83427e061e371507",
      });
      const jsonData = await response.json();
      token = jsonData.access_token;
    } catch (error) {
      errorMessage.textContent = "Failed to fetch token";
    }
  }

  // Fetch search results from Spotify API
  async function fetchMusicData() {
    resultsDiv.innerHTML = '';
    spinner.style.display = 'block';
    paginationControls.style.display = 'none'; // Hide pagination while loading
    errorMessage.textContent = '';

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${keyword}&type=track&offset=${resultOffset}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const jsonData = await response.json();
      tracks = jsonData.tracks.items;
      displayResults();
    } catch (error) {
      errorMessage.textContent = 'Error fetching music data';
    } finally {
      spinner.style.display = 'none';
    }
  }

function displayResults() {
    resultsDiv.innerHTML = '';
    if (tracks.length === 0) {
        resultsDiv.innerHTML = '<p>No results found</p>';
        return;
    }

    tracks.forEach((track) => {
        const albumCover = track.album.images.length ? track.album.images[0].url : 'default-cover.jpg'; // Fallback if no image is available

        const trackElement = document.createElement('div');
        trackElement.innerHTML = `
            <div class="track-result">
                <img src="${albumCover}" alt="Album cover" class="album-cover" />
                <div class="track-info">
                    <h4>${track.name}</h4>
                    <p>Artist: ${track.artists[0].name}</p>
                    <audio controls>
                        <source src="${track.preview_url}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </div>
        `;
        resultsDiv.appendChild(trackElement);
    });

    // Update pagination buttons and show them
    pageInfo.textContent = `Page: ${resultOffset / 20 + 1}`;
    prevButton.disabled = resultOffset === 0; // Disable "Previous" if we're on the first page
    paginationControls.style.display = 'block'; // Show pagination controls after results are displayed
}


  // Handle search on pressing "Enter"
  searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      resultOffset = 0;
      keyword = searchInput.value;
      mainContent.classList.add('hidden'); // Hide the main content
      searchResults.style.display = 'block'; // Show search results
      fetchMusicData();
    }
  });

  // Handle "Next" button click
  nextButton.addEventListener('click', function () {
    resultOffset += 20;
    fetchMusicData();
  });

  // Handle "Previous" button click
  prevButton.addEventListener('click', function () {
    if (resultOffset > 0) {
      resultOffset -= 20;
      fetchMusicData();
    }
  });

  // Initialize app
  fetchToken();
}); 


// Playlist functionality
let userPlaylists = []; // Initialize as an empty array

function fetchUserPlaylists() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('User ID not found in session storage');
        return;
    }
    console.log('Fetching playlists for user:', userId);
    fetch(`/user-playlists/${userId}`)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(playlists => {
            console.log('Playlists fetched:', playlists);
            userPlaylists = Array.isArray(playlists) ? playlists : [];
            displayPlaylists();
        })
        .catch(error => console.error('Error fetching playlists:', error));
}

function displayPlaylists() {
    const playlistsContainer = document.querySelector('.playlists-container');
    playlistsContainer.innerHTML = '';
    if (Array.isArray(userPlaylists)) {
        userPlaylists.forEach(playlist => {
            const playlistElement = document.createElement('div');
            playlistElement.classList.add('playlist-item');
            playlistElement.textContent = playlist.name;
            playlistElement.dataset.playlistId = playlist.id;
            playlistElement.onclick = () => loadPlaylistTracks(playlist.id);
            
            // Add checkbox for deletion
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('playlist-checkbox');
            checkbox.dataset.playlistId = playlist.id;
            checkbox.style.display = 'none'; // Hide by default
            playlistElement.appendChild(checkbox);
            
            playlistsContainer.appendChild(playlistElement);
        });
    } else {
        console.error('userPlaylists is not an array:', userPlaylists);
    }
}

function toggleEditMode() {
    const checkboxes = document.querySelectorAll('.playlist-checkbox');
    const editButton = document.getElementById('editButton');
    const doneButton = document.getElementById('doneButton');
    
    checkboxes.forEach(checkbox => {
        checkbox.style.display = checkbox.style.display === 'none' ? 'inline' : 'none';
    });

    editButton.style.display = editButton.style.display === 'none' ? 'inline' : 'none';
    doneButton.style.display = doneButton.style.display === 'none' ? 'inline' : 'none';
}

function deleteSelectedPlaylists() {
    const selectedPlaylists = document.querySelectorAll('.playlist-checkbox:checked');
    const playlistIds = Array.from(selectedPlaylists).map(checkbox => checkbox.dataset.playlistId);

    if (playlistIds.length === 0) {
        alert('No playlists selected for deletion');
        return;
    }

    if (confirm(`Are you sure you want to delete ${playlistIds.length} playlist(s)?`)) {
        Promise.all(playlistIds.map(id => deletePlaylist(id)))
            .then(() => {
                fetchUserPlaylists();
                toggleEditMode();
            })
            .catch(error => console.error('Error deleting playlists:', error));
    }
}

function deletePlaylist(playlistId) {
    return fetch(`/delete-playlist/${playlistId}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Failed to delete playlist') });
            }
            return response.json();
        });
}

function createPlaylist() {
    console.log('Create playlist function called');
    const name = prompt('Enter playlist name:');
    if (name) {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            console.error('User ID not found in session storage');
            return;
        }
        console.log('Creating playlist:', name, 'for user:', userId);
        fetch('/create-playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, name })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(playlist => {
            console.log('Playlist created:', playlist);
            userPlaylists.push(playlist);
            displayPlaylists();
        })
        .catch(error => console.error('Error creating playlist:', error));
    }
}

function loadPlaylistTracks(playlistId) {
    console.log('Loading tracks for playlist:', playlistId);
    Promise.all([
        fetch(`/playlist/${playlistId}`).then(res => res.json()),
        fetch(`/playlist-tracks/${playlistId}`).then(res => res.json())
    ])
    .then(([playlist, tracks]) => {
        console.log('Playlist:', playlist);
        console.log('Tracks fetched:', tracks);
        if (!playlist.name) {
            throw new Error('Playlist name not found');
        }
        displayPlaylistTracks(playlist.name, tracks);
    })
    .catch(error => {
        console.error('Error loading playlist or tracks:', error);
        const playlistContent = document.querySelector('.playlist-content');
        if (playlistContent) {
            playlistContent.style.cssText = 'display: block !important';
            playlistContent.innerHTML = '<p style="color: white;">Error loading playlist. Please try again.</p>';
        }
    });
}

function displayPlaylistTracks(playlistName, tracks) {
    console.log('Displaying playlist:', playlistName);
    console.log('Tracks to display:', tracks);

    const playlistContent = document.querySelector('.playlist-content');
    const tracksContainer = document.querySelector('.tracks-container');
    const playlistNameElement = document.getElementById('playlist-name');
    
    console.log('Playlist content element:', playlistContent);
    console.log('Tracks container element:', tracksContainer);
    console.log('Playlist name element:', playlistNameElement);

    if (!playlistContent || !tracksContainer || !playlistNameElement) {
        console.error('Playlist content elements not found');
        return;
    }
    
    playlistContent.style.cssText = 'display: block !important';
    playlistNameElement.textContent = playlistName;
    
    tracksContainer.innerHTML = '';
    if (tracks.length === 0) {
        console.log('No tracks, displaying message');
        tracksContainer.innerHTML = '<p>No songs added to this playlist.</p>';
    } else {
        console.log('Displaying tracks');
        tracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.classList.add('track-item');
            trackElement.textContent = `${track.name} - ${track.artist}`;
            tracksContainer.appendChild(trackElement);
        });
    }

    console.log('Playlist display complete');
}

// Call this function when the page loads
window.addEventListener('load', fetchUserPlaylists);

// Add this function to fetch and display Treble Tokens
function fetchTrebleTokens(userId) {
    console.log('Fetching tokens for user ID:', userId);
    return fetch(`/user-tokens/${userId}`)
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching Treble Tokens:', error);
            throw error;
        });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchUserPlaylists();
    const userId = sessionStorage.getItem('userId');
    if (userId) {
        fetchTrebleTokens(userId)
            .then(tokens => {
                // Handle successful token fetch
                console.log('Tokens fetched:', tokens);
            })
            .catch(error => {
                console.error('Failed to fetch tokens:', error);
                // Handle the error (e.g., show a message to the user)
            });
    }
});

// ... rest of your home.js code ...

function playSearchTrack(track) {
    currentPlaylist = [adTrack, track]; // Add the new track to the playlist with the ad
    currentTrackIndex = 1; // Set index to 1 to play the new track (0 is the ad)
    loadMusic(track);
    playMusic();
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('searchResults').style.display = 'none';
}

function displaySearchResults(tracks) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    tracks.forEach(track => {
        const trackElement = document.createElement('div');
        trackElement.innerHTML = `
            <p>${track.name} - ${track.artists.map(a => a.name).join(', ')}</p>
            <button class="play-search-track">Play</button>
        `;
        trackElement.querySelector('.play-search-track').addEventListener('click', () => playSearchTrack(track));
        searchResults.appendChild(trackElement);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const listenNowBtn = document.getElementById('listenNowBtn');
    const searchInput = document.getElementById('searchQuery');

    listenNowBtn.addEventListener('click', function() {
        searchInput.value = 'Cartoon';
        performSearch('Cartoon');
    });

    function performSearch(query) {

        fetchMusicData(query);
    }

    async function fetchMusicData(keyword) {

        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${keyword}&type=track&offset=${resultOffset}`, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const jsonData = await response.json();
            tracks = jsonData.tracks.items;
            displaySearchResults(tracks);
            
            // Show search results and hide main content
            document.getElementById('main-content').style.display = 'none';
            document.getElementById('searchResults').style.display = 'block';
        } catch (error) {
            console.error('Error fetching music data:', error);
            errorMessage.textContent = 'Error fetching music data';
        } finally {
            spinner.style.display = 'none';
        }
    }
});

async function fetchTopTracks() {
    const spinner = document.getElementById('spinner');
    const errorMessage = document.getElementById('error-message');
    const topTracksContainer = document.querySelector('.top-tracks-container'); // Ensure this matches your HTML
    topTracksContainer.innerHTML = ''; // Clear previous results

    if (spinner) spinner.style.display = 'block';
    if (errorMessage) errorMessage.textContent = '';

    try {
        await fetchToken(); // Fetch the token

        const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=10`, {
            headers: {
                Authorization: `Bearer ${token}`, // Use your token here
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const tracks = data.items;

        // Check if the container exists
        if (!topTracksContainer) {
            console.error('Top tracks container not found');
            return; // Exit the function if the container is not found
        }

        // Populate the top tracks section
        tracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.classList.add('top-track');
            trackElement.innerHTML = `
                <img src="${track.album.images[0].url}" alt="${track.name} Cover">
                <h4>${track.name}</h4>
                <p>${track.artists.map(artist => artist.name).join(', ')}</p>
                <button onclick="playTrack('${track.preview_url}')">Play</button>
            `;
            topTracksContainer.appendChild(trackElement); // Append to the container
        });
    } catch (error) {
        console.error('Error fetching top tracks:', error);
        if (errorMessage) errorMessage.textContent = 'Error fetching top tracks: ' + error.message;
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}
