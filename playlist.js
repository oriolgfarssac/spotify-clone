let token = ""; 

function getToken() {
    token = window.location.href.split("access_token=")[1];
}
  
const getPlaylist = async () => {
  const url = `https://api.spotify.com/v1/users/123/playlists`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

let a = getPlaylist();

console.log(a);