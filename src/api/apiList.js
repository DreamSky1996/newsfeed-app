import client from './client';
const { REACT_APP_URL } = process.env;
const { REACT_APP_GOOGLE_MAPS_API_KEY } = process.env;
const {REACT_APP_LOCARION_URL} = process.env;

/**
 * name:            getArticleListApi 
 * parameters:      page(page number) 
 *                  prLocation (location string) 
 *                  userId (userId string)
 * return: rest api response
 * description:     this function is that get article list.
 */
export const getArticleListApi = (page=1, prLocation="", userId="") => {
    var apiUrl = REACT_APP_URL + "list?page=" + page;
    if(prLocation !== "") {
        var location_url = prLocation.replaceAll(" ", "%20");
        apiUrl = apiUrl + "&location=" + location_url;
    }
    if(userId !== "" ){
        apiUrl = apiUrl + "&user_id=" + userId;
    }

    return client(apiUrl)
        .then((data) => data)
        .catch(() => null);
}

/**
 * name:            getLocationListApi 
 * parameters:      locationKey(Key string) 
 * return: rest api response
 * description:     this function is that get location list(max 12).
 */
export const getLocationListApi = (locationKey) => {
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

/**
 * name:            getLocationApi 
 * parameters:      lat & lng(coordinate of device) 
 * return: rest api response (location sting)
 * description:     this function is that get location.
 */
export const getLocationApi = (lat, lng) => {
    var apiUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
    apiUrl = apiUrl + lat + ","+ lng + "&key=" + REACT_APP_GOOGLE_MAPS_API_KEY;
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