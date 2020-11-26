const spotifySearch = document.getElementById("spotify-search");
const input = document.getElementById("spotify-search-bar");

if(document.cookie){
    cooky = document.cookie.split("=");

    console.log(cooky[1]);
}

const inputBoxDelay = (fn, ms) => {
    let timer = 0
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(fn.bind(this, ...args), ms || 0)
    }
}

input.addEventListener("keyup", inputBoxDelay(async (e) => {
    let artists, tracks, option;

    if(input.value.length > 2){
        artists = await fetchArtists(input.value);
        tracks = await fetchTracks(input.value);
        spotifySearch.innerHTML = "";
        if(tracks.tracks.items.length > 0){
            option = document.createElement("li");
            option.innerHTML = "Spår:";
            spotifySearch.appendChild(option);
            fillTrackOptions(tracks.tracks.items);
        }
        if(artists.artists.items.length > 0){
            option = document.createElement("li");
            option.innerHTML = "Artister:";
            spotifySearch.appendChild(option);
            fillArtistOptions(artists.artists.items);
        }
    }
}, 300))

const fillArtistOptions = (items) => {
    for (let i = 0; i < items.length; i++) {
        const element = items[i];
        option = document.createElement("li");
        option.innerHTML = element.name;
        spotifySearch.appendChild(option);
    }
}

const fillTrackOptions = (items) => {
    for (let i = 0; i < items.length; i++) {
        const element = items[i];
        option = document.createElement("li");
        option.innerHTML = element.name + " - " + element.artists[0].name;

        option.style.color = "purple";
        option.addEventListener("click", async () => {
            const imgContainer = document.getElementById("img-container");
            imgContainer.innerHTML = "";
            let img = document.createElement("img");
            img.src = element.album.images[2].url;
            imgContainer.appendChild(img);
        })

        spotifySearch.appendChild(option);
    }
}

const fetchArtists = async(artist) => {
    const response = await fetch("/api/spotify/artist=" + artist);
    const artists = await response.json();
    return artists;
}

const fetchTracks = async(track) => {
    const response = await fetch("/api/spotify/track=" + track);
    const tracks = await response.json();
    return tracks;
}

const getToken = async() => {
    const token = await fetch("/api/spotify/auth");
    return token;
}

const scopes = ["streaming", "user-read-email", "user-read-private"];

// window.onSpotifyWebPlaybackSDKReady = () => {
//     const token = await fetch("/api/spotify/auth");
//     console.log(token);
//     const player = new Spotify.Player({
//         name: 'Web Playback SDK Quick Start Player',
//         getOAuthToken: cb => { cb(token); }
//     });

//     // Error handling
//     player.addListener('initialization_error', ({ message }) => { console.error(message); });
//     player.addListener('authentication_error', ({ message }) => { console.error(message); });
//     player.addListener('account_error', ({ message }) => { console.error(message); });
//     player.addListener('playback_error', ({ message }) => { console.error(message); });

//     // Playback status updates
//     player.addListener('player_state_changed', state => { console.log(state); });

//     // Ready
//     player.addListener('ready', ({ device_id }) => {
//         console.log('Ready with Device ID', device_id);
//     });

//     // Not Ready
//     player.addListener('not_ready', ({ device_id }) => {
//         console.log('Device ID has gone offline', device_id);
//     });

//     // Connect to the player!
//     player.connect();

//     const btn = document.getElementById("playpause");
//     btn.addEventListener("click", () => {
//         if(btn.classList.contains("play")){
//             player.resume().then(() => {
//                 console.log("playing");
//             })
//             btn.classList.remove("play");
//         }
//         else{
//             player.pause().then (() => {
//                 console.log("paused");
//             })
//             btn.classList.add("play");
//         }
//     })

// };