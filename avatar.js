const HTTPClient = require("./HTTPClient");

function setNew( clientUser, chatChannel, tags ) {
    if ( checkLMC(clientUser, tags) )
        return;
        
    let options = {
        host: "e621.net",
        port: 443,
        path: "/posts/random.json",
        method: "GET",
        headers: {
            "User-Agent": "MacBot/1.0 (by Yoyorony)"
        }
    };

    options.path += "?tags=rating:safe+type:png";

    if ( tags ) {
        options.path += "+" + tags;
    }

    objects = {
        "clientUser": clientUser,
        "chatChannel": chatChannel,
        "tags": tags
    };

    HTTPClient.requestJSON(options, objects, onResult, onError);
}

function checkLMC( clientUser, tags ) {
    if ( !tags || !tags.toLowerCase().includes("les_mac_copains") || !tags.toLowerCase().includes("rating:explicit") )
        return false;
    clientUser.setAvatar( "./tmp/YoyoronyMCnsfw.png" );
    return true;
}

function onResult( resultCode, json, objects ) {
    if ( resultCode === 404 )
        objects.chatChannel.send("You have so much disgusting tastes, it returned no result...\n"
                + "You make me sick you degenerate fuck.");
    else if ( resultCode !== 200) 
        onError( objects, json, "Error code !== 200" );
    else {
        if ( !json || !json.post.id || !json.post.file.size || !json.post.file.ext ) {
            onError( objects, json, "no json or id or sample url or file url or file size or file ext" );
            return;
        }

        try {
            if ( !json.post.sample.url || !json.post.file.url )
                setNew( objects.clientUser, objects.chatChannel, objects.tags ); // try again
            else if ( json.post.file.ext !== "png" )
                throw "Site returned a non png file.";
            else {
                objects.clientUser.setAvatar( json.post.sample.url );
                objects.chatChannel.send("Avatar successfully changed !\nThere will be a short delay before everyone sees it.");
            }
        } catch(err) { onError( objects, json, err ); }
    }
}

function onError( objects, json, err ) {
    console.log(err + ". JSON :\n" + JSON.stringify(json));
    objects.chatChannel.send("The site returned an error.\n"
            + "Looks like we got the dumbest person alive here !");
}

function show( clientUser, chatChannel ) {
    let url = clientUser.avatarURL( {format: "png", size: 1024} );
    if (url)
        chatChannel.send( {files: [url]} )
    else
        chatChannel.send("I don't have any avatar right now.");
}

exports.setNew = setNew;
exports.show = show;