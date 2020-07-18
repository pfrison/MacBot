const HTTPClient = require("./HTTPClient");

function randomE621( chatChannel, tags ) {
    let options = {
        host: "e621.net",
        port: 443,
        path: "/posts/random.json",
        method: "GET",
        headers: {
            "User-Agent": "MacBot/1.0 (by Yoyorony)"
        }
    };

    if ( tags ) {
        options.path += "?tags=" + tags;
    }

    objects = {
        "chatChannel": chatChannel
    };

    HTTPClient.requestJSON(options, objects, onResult, onError);
}

function onResult( resultCode, json, objects ) {
    if ( resultCode === 404 )
        objects.chatChannel.send("You have so much disgusting tastes, it returned no result...\n"
                + "You make me sick you degenerate fuck.");
    else if ( resultCode !== 200) 
        onError( objects );
    else {
        if ( !json || !json.post.file.url ) {
            onError( objects );
            return;
        }

        objects.chatChannel.send( {files: [json.post.file.url]} );
    }
}

function onError( objects ) {
    objects.chatChannel.send("The site returned an error.\n"
            + "Looks like we got the dumbest person alive here !");
}

exports.randomE621 = randomE621;