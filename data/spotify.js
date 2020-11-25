const SpotifyWebApi = require("spotify-web-api-node");
const credentials = require("./credentials.json");

const spotifyApi = new SpotifyWebApi({
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
    redirectUri: credentials.localhost3000callback
});

spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
    function(data) {
      console.log('Artist albums', data.body);
    },
    function(err) {
      console.error(err);
    }
);

