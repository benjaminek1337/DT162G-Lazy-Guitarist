const credentials = requrie("./credentials.json")
const spotifyAPIController = (() =>{

    let clientId;
    let secretId;
    if(credentials != undefined){
        clientId = credentials.clientId;
        secretId = credentials.secretId;
    } else {
        return console.log("Couldnt get credentials")
    }

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