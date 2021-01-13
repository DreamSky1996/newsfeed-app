/**
 * Name:        Client
 * parameter:   endpoint (rest api url)
 * return:      rest api response
 * description: this function is that request api and receive response.
 */
function Client(endpoint) {
    return window.fetch(endpoint)
    .then(r => {
        if (r.status >= 200 && r.status < 300) {
            return r.json();
          }
          return null
    }).catch(error =>{
        return null
    });
}

export default Client;