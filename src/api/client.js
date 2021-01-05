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