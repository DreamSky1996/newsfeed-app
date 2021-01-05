import client from './client';
const { REACT_APP_URL } = process.env;
const { REACT_APP_GOOGLE_MAPS_API_KEY } = process.env;
const {REACT_APP_LOCARION_URL} = process.env;

export const getArticleListApi = (page=1, prLocation="", userId="") => {
    var apiUrl = REACT_APP_URL + "newsfeed_articles/list?page=" + page;
    if(prLocation !== "") {
        // var locations = prLocation.split(",");
        var location_url = prLocation.replaceAll(" ", "%20");
        apiUrl = apiUrl + "&location=" + location_url;
    }
    apiUrl = apiUrl + "&user_id=" + userId;

    return client(apiUrl)
        .then((data) => data)
        .catch(() => null);
}

export const getLocationListApi = (locationKey) => {
    // var apiUrl = REACT_APP_URL + "newsfeed_locations/matches?startswith=" + locationKey;
    var apiUrl = REACT_APP_LOCARION_URL  + "matches?startswith=" + locationKey;
    console.log(apiUrl);
    return window
    .fetch(apiUrl)
    .then(r => {
        if (r.status >= 200 && r.status < 300) {
            return r.json();
          }
          return null
    }).catch(error =>{
        return null
    });
}

export const getLocationApi = (lat, lng) => {
    // var apiUrl = REACT_APP_URL + "newsfeed_locations/suburb?lat=" + lat;
    // apiUrl =apiUrl + "&lng=" + lng;
    var apiUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
    apiUrl = apiUrl + lat + ","+ lng + "&key=" + REACT_APP_GOOGLE_MAPS_API_KEY;
    // apiUrl = REACT_APP_URL + "newsfeed_locations/suburb?lat=-33.887765&lng=151.271559";
    console.log(apiUrl);
    return window
    .fetch(apiUrl)
    .then(r => {
        if (r.status >= 200 && r.status < 300) {
            return r.text();
          }
          return null
    }).catch(error =>{
        return null
    });

}