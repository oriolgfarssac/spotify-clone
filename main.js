import { clientId, clientSecret } from "./env.js";

const searchButton = document.querySelector(".spotify-clone__search-button");
const searchInput = document.querySelector(".spotify-clone__search-input");
const eliminateButton = document.querySelector(".spotify-clone__search-delete");
const mainContainer = document.querySelector(".spotify-clone__main");

let token = null;
let currentQuery = "";
let currentOffset = 0;

// Event Listeners
searchButton.addEventListener("click", () => {
  const query = searchInput.value;
  if (query.length <= 2) {
    alert("Introdueix almenys 2 caràcters");
  } else {
    currentQuery = query;
    currentOffset = 0;
    getAccessToken().then((accessToken) => {
      if (accessToken) {
        searchSpotifyTracks(currentQuery, accessToken, currentOffset);
      }
    });
  }
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchButton.click();
  }
});

eliminateButton.addEventListener("click", () => {
  searchInput.value = "";
  const tracksContainer = document.querySelector(".spotify-clone__results");
  tracksContainer.innerHTML = "";
});

// Function to get the Spotify access token
const getAccessToken = () => {
  const url = "https://accounts.spotify.com/api/token";
  const credentials = btoa(`${clientId}:${clientSecret}`);

  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error fetching access token: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      token = data.access_token;
      return token;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
};

// Function to search tracks on Spotify
const searchSpotifyTracks = (query, accessToken, offset = 0) => {
  const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=12&offset=${offset}`;

  fetch(searchUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      const tracks = data.tracks.items;
      createSongs(tracks);
    })
    .catch((error) => {
      console.error("Error searching songs:", error);
    });
};

// Function to create track elements
const createSongs = (tracks) => {
  const tracksContainer = document.querySelector(".spotify-clone__results");

  if (currentOffset === 0) {
    tracksContainer.innerHTML = "";
  }

  tracks.forEach((track) => {
    const trackElement = document.createElement("div");
    trackElement.classList.add("spotify-clone__track");

    const albumImage = document.createElement("img");
    albumImage.src = track.album.images[0]?.url || "placeholder.jpg";
    albumImage.alt = `Album cover of ${track.album.name}`;
    albumImage.classList.add("spotify-clone__track-album-image");

    const trackDetails = document.createElement("div");
    trackDetails.classList.add("spotify-clone__track-details");

    const trackTitle = document.createElement("h3");
    trackTitle.textContent = track.name;
    trackTitle.classList.add("spotify-clone__track-title");

    const trackArtist = document.createElement("p");
    trackArtist.textContent = track.artists.map((artist) => artist.name).join(", ");
    trackArtist.classList.add("spotify-clone__track-artist");


    const trackAlbum = document.createElement("p");
    trackAlbum.textContent = `Album: ${track.album.name}`;
    trackAlbum.classList.add("spotify-clone__track-album");

    trackDetails.appendChild(trackTitle);
    trackDetails.appendChild(trackArtist);
    trackDetails.appendChild(trackAlbum);


    trackElement.appendChild(albumImage);
    trackElement.appendChild(trackDetails);

    tracksContainer.appendChild(trackElement);
  });

  let loadMoreButton = document.querySelector(".spotify-clone__search-load-more");
  if (!loadMoreButton) {
    loadMoreButton = document.createElement("button");
    loadMoreButton.textContent = "Load more";
    loadMoreButton.classList.add("spotify-clone__search-load-more");
    mainContainer.appendChild(loadMoreButton);
  }

  loadMoreButton.addEventListener("click", () => {
    loadMoreTracks();
  });
};


const loadMoreTracks = () => {
  currentOffset += 12;
  getAccessToken().then((accessToken) => {
    if (accessToken) {
      searchSpotifyTracks(currentQuery, accessToken, currentOffset);
    }
  });
};
