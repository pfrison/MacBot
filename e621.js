const HTTPClient = require("./HTTPClient");
const channels = require("./channels");

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
        onError( objects, json, "Error code !== 200" );
    else {
        if ( !json || !json.post.id || !json.post.file.size || !json.post.file.ext ) {
            onError( objects, json, "no json or id or sample url or file url or file size or file ext" );
            return;
        }

        try {
            if ( !json.post.sample.url || !json.post.file.url )
                objects.chatChannel.send("Couldn't get the direct url. Here is a link to the post : https://e621.net/posts/" + json.post.id);
            else if ( json.post.file.ext === "swf" )
                objects.chatChannel.send("This is flash content click here to play it : https://e621.net/posts/" + json.post.id );
            else if ( parseInt(json.post.file.size) > maxSize )
                objects.chatChannel.send("File size is too large only a preview is shown. Post id : " + json.post.id,
                        {files: [json.post.sample.url]} );
            else 
                objects.chatChannel.send( "Post id : " + json.post.id,
                        {files: [json.post.file.url]} );
        } catch(err) { onError( objects, json, err ); }
    }
}

function randomBestOfE621( chatChannel, tags ) {
    let options = {
        host: "e621.net",
        port: 443,
        path: "/posts.json?page=1&limit=20&tags=order:score+-type:swf+-type:webm",
        method: "GET",
        headers: {
            "User-Agent": "MacBot/1.0 (by Yoyorony)"
        }
    };

    if ( tags ) {
        options.path += "+" + tags;
    }

    objects = {
        "chatChannel": chatChannel
    };

    HTTPClient.requestJSON(options, objects, onResultBestOf, onError);
}

function randomWorstOfE621( chatChannel, tags ) {
    let options = {
        host: "e621.net",
        port: 443,
        path: "/posts.json?page=1&limit=20&tags=order:score_asc+-type:swf+-type:webm",
        method: "GET",
        headers: {
            "User-Agent": "MacBot/1.0 (by Yoyorony)"
        }
    };

    if ( tags ) {
        options.path += "+" + tags;
    }

    objects = {
        "chatChannel": chatChannel
    };

    HTTPClient.requestJSON(options, objects, onResultBestOf, onError);
}

function onResultBestOf( resultCode, json, objects ) {
    if ( resultCode === 404 )
        objects.chatChannel.send("You have so much disgusting tastes, it returned no result...\n"
                + "You make me sick you degenerate fuck.");
    else if ( resultCode !== 200) 
        onError( objects, json, "Error code !== 200" );
    else {
        if ( !json || !json.posts || !json.posts.length ) {
            onError( objects, json, "no json or posts, or posts is not an array" );
            return;
        }

        let randomPost = json.posts[ Math.floor(Math.random() * json.posts.length) ];
        if ( !randomPost || !randomPost.id || !randomPost.file.size || !randomPost.file.ext ) {
            onError( objects, json, "unable to get a random post or no random post id or file size or file ext" );
            return;
        }

        try {
            if ( !randomPost.sample.url || !randomPost.file.url )
                objects.chatChannel.send("Couldn't get the direct url. Here is a link to the post : https://e621.net/posts/" + randomPost.id);
            else if ( randomPost.file.ext === "swf" )
                objects.chatChannel.send("This is flash content click here to play it : https://e621.net/posts/" + randomPost.id );
            else if ( parseInt(randomPost.file.size) > maxSize )
                objects.chatChannel.send("File size is too large, only a preview is shown. Post id : " + randomPost.id,
                        {files: [randomPost.sample.url]} );
            else 
                objects.chatChannel.send( "Post id : " + randomPost.id,
                        {files: [randomPost.file.url]} );
        } catch(err) { onError( objects, json, err ); }
    }
}

function onError( objects, json, err ) {
    console.log(err + ". JSON :\n" + JSON.stringify(json));
    objects.chatChannel.send("The site returned an error.\n"
            + "Looks like we got the dumbest person alive here !");
}

function handleReaction( message ) {
    // is it an e621 message ?
    let messageStr = message.toString();
    if ( messageStr.includes("Post id :") || messageStr.includes("https://e621.net/posts/") ) {
        let nsfwChannel = channels.getNSFWChannel();
        if ( nsfwChannel ) {
            nsfwChannel.send("Someone is masturbating to this shit (reacted my private message with '❤️') :\n" + messageStr, message.attachments.array());
        }
    }
}

exports.randomE621 = randomE621;
exports.randomBestOfE621 = randomBestOfE621;
exports.randomWorstOfE621 = randomWorstOfE621;
exports.handleReaction = handleReaction;