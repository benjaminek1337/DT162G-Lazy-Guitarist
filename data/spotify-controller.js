const spotifyAPIController = (() =>{

    const clientId = "89d6f0780e1042d3a151359008268f2e";
    const clientSecret = "6c06f99ed2964c47815858db8df80e00";

    const getToken= async () => {
        const result = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST", 
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + btoa(clientId + ":" + clientSecret)
            },
            body: "grant_type=client_credentials"
        });
        const data = await result.json();
        return data.access_token;
    };

})();



// const getGenres = async (token) => {
//     const result = await
// }