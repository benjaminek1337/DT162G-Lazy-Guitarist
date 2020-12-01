const spotifySearch = document.getElementById("spotify-search");
const input = document.getElementById("spotify-search-bar");
const btnPlay = document.getElementById("btn-playpause");
const btnVol = document.getElementById("vol");
const btnRepeatThirty = document.getElementById("btn-repeat-thirty");
const btnRepeatTen = document.getElementById("btn-repeat-ten");
const durationSlider = document.getElementById("song-duration-slider");
const volumeSlider = document.getElementById("volume-slider");


let auth_token;
let path = window.location.pathname.substring(1);

// TODO - Sätt timeout att förnya auth med timma - duration. Sen interval varje timma. Kolla expiration
const onInit = () => {
    getCookie();
    durationSlider.value = 0;
}

const getCookie = () => {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookiePair = cookies[i].split("=");
        if(cookiePair[0].trim() == "access_token"){
            console.log("Authentication Token Found");
            return auth_token = cookiePair[1];
        }
    }
    console.log("Fetching Authentication Token");
    return window.location.href = "/api/spotify/auth?url=" + path;

}

const delay = (fn, ms) => {
    let timer = 0
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(fn.bind(this, ...args), ms || 0)
    }
}

window.onload = () => {
    onInit();
}

window.onSpotifyWebPlaybackSDKReady = () => {
    let id;
    let interval;

    const player = new Spotify.Player({
        name: 'Lazy Guitarist Web Player',
        getOAuthToken: cb => { cb(auth_token); }
    });
    // Error handling
    // player.addListener('initialization_error', ({ message }) => { console.error(message); });
    // player.addListener('authentication_error', ({ message }) => { console.error(message); });
    // player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });
    

    // Playback status updates
    player.addListener('player_state_changed', state => { 
        console.log(state); 
        playingOrPausedEvents(state);
    });

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

    btnPlay.addEventListener("click", () => {
        player.getCurrentState().then(state => {
            playingOrPausedEvents(state);
        })
        player.togglePlay();
    });

    input.addEventListener("keyup", delay(async (e) => {
        let tracks, option;
    
        if(input.value.length > 2){
            tracks = await fetchTracks(input.value);
            spotifySearch.innerHTML = "";
            if(tracks.tracks.items.length > 0){
                option = document.createElement("li");
                option.innerHTML = "Låtar:";
                spotifySearch.appendChild(option);
                fillTrackOptions(tracks.tracks.items);
            }
        }
    }, 300))
    
    durationSlider.addEventListener("input", () => {
        player.getCurrentState().then(state => {
            if(state){
                player.seek(durationSlider.value);
            }
        })
    })
    
    volumeSlider.addEventListener("input", () => {
        player.setVolume(volumeSlider.value / (100 + ((100 - volumeSlider.value) * 2)));
        if(volumeSlider.value > 50){
            btnVol.className = ""
            btnVol.classList.add("high")
        } else if(volumeSlider.value > 0 && volumeSlider.value <= 50) {
            btnVol.className = ""
            btnVol.classList.add("low")
        } else{
            btnVol.className = ""
            btnVol.classList.add("no")
        }
    });
    
    btnVol.addEventListener("click", () =>{
        player.setVolume(0);
        btnVol.classList.add("no")
        volumeSlider.value = 0;
    })

    // Skriv ett sätt att loopa ett tidsintervall av låten
    // Förslagsvis - knappen till höger öppnar en input, inputen tar emot sekunder och kör ett interval på så länge.
    // Knappen avbryter även repeaten sen.

    btnRepeatThirty.addEventListener("click", () => {
        reverseForMs(30000);
    })

    btnRepeatTen.addEventListener("click", () => {
        reverseForMs(10000);
    })
    
    // Connect to the player!
    player.connect();

    player.setVolume(volumeSlider.value / (100 + ((100 - volumeSlider.value) * 2)));

    function playSong(uri){
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [uri] }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${auth_token}`
            },
        });
        btnPlay.classList.remove("paused");
        btnPlay.classList.add("playing");
        if(interval != undefined)
            clearInterval(interval);
        setTimeout(() => {
            player.getCurrentState().then(state => {
                durationSlider.setAttribute("max", state.duration);
                //playingOrPausedEvents(state);
            })
        }, 300)
    } 

    function playingOrPausedEvents(state){
        if(state.paused){
            btnPlay.classList.remove("playing");
            btnPlay.classList.add("paused");
            clearInterval(interval);
        } else {
            btnPlay.classList.remove("paused");
            btnPlay.classList.add("playing");
            if(state.position < state.duration){
                interval = setInterval(() => {
                    player.getCurrentState().then(state => {
                        durationSlider.value = state.position;
                    })
                }, 300)
            } else {
                clearInterval(interval);
                durationSlider.value = 0;
                btnPlay.classList.remove("playing");
                btnPlay.classList.add("paused")
            }
        }
    }

    function reverseForMs(time){
        player.getCurrentState().then(state => {
            if(!state){
                return console.log("Nope");
            } 
            if(state.position > time)
                player.seek(state.position - time);
            else
                player.seek(0);
        })
    }
    
    function fillTrackOptions(items){
        for (let i = 0; i < items.length; i++) {
            const element = items[i];
            option = document.createElement("li");
            option.innerHTML = element.name + " - " + element.artists[0].name;
    
            option.style.color = "purple";
            option.addEventListener("click", async () => {
                const imgContainer = document.getElementById("img-container");
                imgContainer.innerHTML = "";
                let img = document.createElement("img");
                img.setAttribute("height", 200)
                img.src = element.album.images[1].url;
                trackUri = element.uri;
                imgContainer.appendChild(img);
                playSong(element.uri);
            })
    
            spotifySearch.appendChild(option);
        }
    }
    
    const fetchTracks = async(track) => {
        const response = await fetch("/api/spotify/track=" + track);
        const tracks = await response.json();
        return tracks;
    }

};