const HTTPClient = require("./HTTPClient");

const maxSize = 2 * 1024 * 1024; // 2 Mo

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
        if ( !json || !json.post.id || !json.post.sample.url || !json.post.file.url
                    || !json.post.file.size || !json.post.file.ext ) {
            onError( objects );
            return;
        }

        if ( json.post.file.ext === "swf" )
            objects.chatChannel.send("This is flash content click here to play it : https://e621.net/posts/" + json.post.id );
        else if ( parseInt(json.post.file.size) > maxSize )
            objects.chatChannel.send("File size is too large only a preview is shown. Post id : " + json.post.id,
                    {files: [json.post.sample.url]} );
        else 
            objects.chatChannel.send( "Post id : " + json.post.id,
                    {files: [json.post.file.url]} );
    }
}

function onError( objects ) {
    objects.chatChannel.send("The site returned an error.\n"
            + "Looks like we got the dumbest person alive here !");
}

exports.randomE621 = randomE621;