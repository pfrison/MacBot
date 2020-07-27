const xmlHttp = new XMLHttpRequest();

var URL = "/remote/remoteUpdateScreen?sessionCode=";

self.addEventListener("message", (e) => {
    if ( e.data ) {
        URL += e.data;
        //setInterval setTimeout
        setInterval(function() {
            self.postMessage( httpGetBase64Refresh() );
        }, 100);
    }
});

function httpGetBase64Refresh() {
    xmlHttp.open( "GET", URL, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}
