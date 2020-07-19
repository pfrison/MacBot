const http = require("http");
const https = require("https");

function requestJSON( options, objects, onResult, onError ) {
    requestText(options, objects, (statusCode, output, objects) => {
        let json = JSON.parse(output);
        onResult(statusCode, json, objects);
    }, onError);
}

function requestText( options, objects, onResult, onError ) {
    const port = options.port == 443 ? https : http;
    let output = "";
    
    const req = port.request(options, (res) => {
        res.setEncoding('utf8');
    
        res.on('data', (chunk) => {
            output += chunk;
        });
    
        res.on('end', () => {
            try { onResult(res.statusCode, output, objects); }
            catch (err) { console.log(err); onError(objects, err); }
        });
    });
    
    req.on('error', (err) => { onError(objects, err); });
    
    req.end();
}


exports.requestJSON = requestJSON;
exports.requestText = requestText;