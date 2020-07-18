const http = require("http");
const https = require("https");

function requestJSON( options, objects, onResult, onError ) {
    const port = options.port == 443 ? https : http;
    let output = "";
    
    const req = port.request(options, (res) => {
        res.setEncoding('utf8');
    
        res.on('data', (chunk) => {
            output += chunk;
        });
    
        res.on('end', () => {
            try {
                let json = JSON.parse(output);
                onResult(res.statusCode, json, objects);
            } catch (err) {
                onError(objects, err);
            }
        });
    });
    
    req.on('error', (err) => { onError(objects, err); });
    
    req.end();
}


exports.requestJSON = requestJSON;