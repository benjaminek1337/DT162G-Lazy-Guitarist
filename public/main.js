const spotifySearch = document.getElementById("spotify-search");
const input = document.getElementById("spotify-search-bar");
let auth_token;
let path = window.location.pathname.substring(1);

// HITTA NÅTT JÄVLA SÄTT ATT FÖRNYA AUTHEN OCH REDIRECTA TILL SAMMA SIDA
const onInit = () => {
    getCookie();
    setInterval(() => {window.location.href = "/api/spotify/auth?url=" + path}, 3500000);
}

const getCookie = () => {
    let cookies = document.cookie.split(";");
    if(cookies){
        for (let i = 0; i < cookies.length; i++) {
            const cookiePair = cookies[i].split("=");
            if(cookiePair[0].trim() == "access_token"){
                console.log("Authentication Token Found");
                return auth_token = cookiePair[1];
            }
        }
        console.log("Fetching Authentication Cookie");
        return window.location.href = "/api/spotify/auth?url=" + path;
    }else{
        console.log("Fetching Authentication Cookie");
        window.location.href = "/api/spotify/auth?url=" + path;
    }
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
let trackUri;
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
            trackUri = element.uri;
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


window.onload = () => {
    onInit();
}

window.onSpotifyWebPlaybackSDKReady = () => {
    let id;
    const player = new Spotify.Player({
        name: 'Lazy Guitarist Web Player',
        getOAuthToken: cb => { cb(auth_token); }
    });
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        id = device_id;
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        id = device_id;
        console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();

    const btn = document.getElementById("playpause");
    btn.addEventListener("click", () => {
        player.togglePlay();
    });

    const slider = document.getElementById("volume-slider");
    player.setVolume(slider.value / 100);
    slider.addEventListener("input", () => {
        player.setVolume(slider.value / 100);
    });

    // Skriv ett sätt att loopa ett tidsintervall av låten

    const btnBackward = document.getElementById("btn-backward");
    const btnForward = document.getElementById("btn-forward");
    btnBackward.addEventListener("click", () => {
        player.getCurrentState().then(state => {
            if(!state){
                return console.log("Nope");
            } 
            console.log(state.position);
            console.log(-30 * 1000);
            if(state.position > 30000)
                player.seek(state.position - 30000);
            else
                player.seek(0);
        })
    })
    btnForward.addEventListener("click", () => {
        player.getCurrentState().then(state => {
            if(!state){
                return console.log("Nope");
            } 

            if(state.position + 30000 < state.duration)
                player.seek(state.position + 30000)
        })
    })

    //Spola fram 30 sek, player.seek(30 * 1000)
    //Spola bak 30 sek, player.seek(-30 * 1000) fixa så att de båda inte kan överskrida total eller under 0

    const playsongbtn = document.getElementById("load-song");
    playsongbtn.addEventListener("click", () => {
        // https://developer.spotify.com/documentation/web-api/reference/player/start-a-users-playback/ Player reference
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [trackUri] }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${auth_token}`
            },
          });
    })

};