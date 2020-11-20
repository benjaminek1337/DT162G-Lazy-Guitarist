const credentials = requrie("./credentials.json")
const spotifyAPIController = (() =>{

    const clientId = credentials.clientId;
    const clientSecret = credentials.secretId;

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