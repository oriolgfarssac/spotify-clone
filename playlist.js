let token = "";
let selectedPlaylistId = null;

function getToken() {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  token = urlParams.get("access_token");

  if (token) {
    getPlaylist().then((playlists) => loadPlaylist(playlists));
  }
}

const getPlaylist = async () => {
  if (!token) {
    return [];
  }

  try {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    return [];
  }
};

const loadPlaylist = (playlists) => {
  const container = document.querySelector(".playlist__playlists-list");
  container.innerHTML = "";

  if (playlists.length > 0) {
    playlists.forEach((playlist) => {
      const playlistDiv = document.createElement("div");
      playlistDiv.classList.add("playlist__playlists-item");
      playlistDiv.textContent = playlist.name;
      playlistDiv.dataset.playlistId = playlist.id;
      container.appendChild(playlistDiv);

      playlistDiv.addEventListener("click", () => {
        selectedPlaylistId = playlist.id;
        loadSongs(playlist.id);
      });
    });
  }
};

const loadSongs = async (playlistId) => {
  const container = document.querySelector(".playlist__songs-list");
  container.innerHTML = "";

  if (!playlistId) {
    return;
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const songs = data.items;

    if (songs && songs.length > 0) {
      songs.forEach((song) => {
        const songDiv = document.createElement("div");
        songDiv.classList.add("playlist__songs-item");

        const songName = document.createElement("p");
        songName.textContent = `🎵 ${song.track.name}`;

        const artistNames = song.track.artists.map(artist => artist.name).join(", ");
        const artist = document.createElement("p");
        artist.textContent = `🎙️ ${artistNames}`;

        const dateAdded = document.createElement("p");
        const formattedDate = new Date(song.added_at).toLocaleDateString();
        dateAdded.textContent = `📅 Added: ${formattedDate}`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("playlist__songs-delete");
        deleteButton.addEventListener("click", () => deleteSong(playlistId, song.track.uri, songDiv));

        songDiv.appendChild(songName);
        songDiv.appendChild(artist);
        songDiv.appendChild(dateAdded);
        songDiv.appendChild(deleteButton);
        container.appendChild(songDiv);
      });
    }
  } catch (error) {
    console.error("Error loading songs:", error);
  }
};

const deleteSong = async (playlistId, trackUri, songDiv) => {
  let response = prompt("Are you sure you want to delete this song?");
  if (response.toLowerCase() !== "yes") {
    return;
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tracks: [{ uri: trackUri }],
      }),
    });

    if (response.ok) {
      songDiv.remove();
    }
  } catch (error) {
    console.error("Error deleting song:", error);
  }
};

const displaySavedSongs = () => {
  const savedSongs = JSON.parse(localStorage.getItem("savedSongs")) || [];
  let container = document.querySelector(".playlist__selected-songs-list");
  container.innerHTML = "";

  if (savedSongs.length === 0) {
    container.innerHTML = "<p>No songs added to the playlist yet.</p>";
    return;
  }

  savedSongs.forEach((track, index) => {
    const trackElement = document.createElement("div");
    trackElement.classList.add("playlist__selected-songs-track");

    const trackTitle = document.createElement("p");
    trackTitle.textContent = track.name;
    trackTitle.classList.add("spotify-clone__track-title");

    const trackArtist = document.createElement("p");
    trackArtist.textContent = track.artists.map((artist) => artist.name).join(", ");
    trackArtist.classList.add("spotify-clone__track-artist");

    const addButton = document.createElement("button");
    addButton.textContent = "Add to Playlist";
    addButton.classList.add("spotify-clone__track-add-button");
    addButton.addEventListener("click", () => {
      if (!selectedPlaylistId) {
        alert("Please select a playlist first.");
        return;
      }

      addSongToPlaylist(selectedPlaylistId, track.uri);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("spotify-clone__track-delete-button");
    deleteButton.addEventListener("click", () => {
      deleteSongFromPlaylist(index);
    });

    trackElement.appendChild(trackTitle);
    trackElement.appendChild(trackArtist);
    trackElement.appendChild(addButton);
    trackElement.appendChild(deleteButton);

    container.appendChild(trackElement);
  });
};

const deleteSongFromPlaylist = (index) => {
  let savedSongs = JSON.parse(localStorage.getItem("savedSongs")) || [];
  savedSongs.splice(index, 1);  
  localStorage.setItem("savedSongs", JSON.stringify(savedSongs));
  displaySavedSongs();  
};

const addSongToPlaylist = async (playlistId, trackUri) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [trackUri],
      }),
    });

    if (response.ok) {
      alert("Song added to playlist!");
      loadSongs(playlistId);
    }
  } catch (error) {
    console.error("Error adding song to playlist:", error);
  }
};

window.onload = function () {
  getToken();
  displaySavedSongs();
};
