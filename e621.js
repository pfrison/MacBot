const HTTPClient = require("./HTTPClient");
const channels = require("./channels");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const maxSize = 2 * 1024 * 1024; // 2 Mo

function randomE621( chatChannel, tags ) {
    if ( checkLMC(chatChannel, tags) )
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
        onError( objects, json, "result code !== 200" );
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
    if ( checkLMC(chatChannel, tags) )
        return;

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
    if ( checkLMC(chatChannel, tags) )
        return;

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
        onError( objects, json, "result code !== 200" );
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

function randomTag( chatChannel, tag ) {
    let options = {
        host: "e621.net",
        port: 443,
        method: "GET",
        headers: {
            "User-Agent": "MacBot/1.0 (by Yoyorony)"
        }
    };

    objects = {
        "chatChannel": chatChannel
    };

    if ( !tag ) {
        options.path = "/tags?search%5Bhas_wiki%5D=yes&search%5Bcategory%5D=0";
        HTTPClient.requestText(options, objects, onResultTagSize, onError);
    } else {
        options.path = "/wiki_pages/show_or_new?title=" + tag;
        HTTPClient.requestRedirect(options, objects, onResultTagWiki, onError);
    }
}

function onResultTagSize( resultCode, html, objects ) {
    if ( resultCode !== 200) 
        onError( objects, json, "result code !== 200 (" + resultCode + ")" );
    else {
        const dom = new JSDOM(html);
        
        if ( !dom.window.document ) {
            onError( objects );
            return;
        }
        
        let pageList = dom.window.document.querySelectorAll(".paginator menu .numbered-page");
        let lastPage = pageList[pageList.length - 1];
        let nPages = parseInt(lastPage.textContent);

        let randomPage = Math.ceil(Math.random() * nPages); // [1, max]
        
        let options = {
            host: "e621.net",
            port: 443,
            path: "/tags.json?page=" + randomPage + "&search%5Bhas_wiki%5D=yes&search%5Bcategory%5D=0",
            method: "GET",
            headers: {
                "User-Agent": "MacBot/1.0 (by Yoyorony)"
            }
        };

        HTTPClient.requestJSON(options, objects, onResultTagPage, onError);
    }
}

function onResultTagPage( resultCode, json, objects ) {
    if ( resultCode !== 200) 
        onError( objects, json, "result code !== 200" );
    else {
        if ( !json || !json.length ) {
            onError( objects, json, "Malformed json" );
            return;
        }

        let randomTag = json[Math.floor(Math.random() * json.length)]; // [0, length-1]

        let options = {
            host: "e621.net",
            port: 443,
            path: "/wiki_pages/show_or_new?title=" + randomTag.name,
            method: "GET",
            headers: {
                "User-Agent": "MacBot/1.0 (by Yoyorony)"
            }
        };

        HTTPClient.requestRedirect(options, objects, onResultTagWiki, onError);
    }
}

function onResultTagWiki( resultCode, url, objects ) {
    if ( resultCode < 300 || resultCode > 399 )
        onError( objects, url, "result code is not a redirect" );
    else {
        if ( !url ) {
            onError( objects, url, "redirect url undefined" );
            return;
        }

        let options = {
            host: "e621.net",
            port: 443,
            path: new URL(url).pathname + ".json",
            method: "GET",
            headers: {
                "User-Agent": "MacBot/1.0 (by Yoyorony)"
            }
        };
    
        HTTPClient.requestJSON(options, objects, onResultTag, onError);
    }
}

function onResultTag( resultCode, json, objects ) {
    if ( resultCode === 404 )
        objects.chatChannel.send("You have so much disgusting tastes, it returned no result...\n"
                + "You make me sick you degenerate fuck.");
    else if ( resultCode !== 200) 
        onError( objects, json, "result code !== 200" );
    else {
        if ( !json || !json.title || !json.body ) {
            onError( objects, json, "no json or posts, or posts is not an array" );
            return;
        }

        let tag = json.title;

        json.body = json.body.split("[[").join("");
        json.body = json.body.split("]]").join("");
        json.body = json.body.split("\r").join("");
        json.body = json.body.split("*").join("  ");
        json.body = json.body.split("\n").join("\n> ");
        json.body = json.body.split("[b]").join("**");
        json.body = json.body.split("[/b]").join("**");
        json.body = json.body.split("[i]").join("*");
        json.body = json.body.split("[/i]").join("*");
        json.body = json.body.split("[u]").join("**");
        json.body = json.body.split("[/u]").join("**");
        json.body = "> " + json.body;

        json.title = "**" + json.title.charAt(0).toUpperCase() + json.title.slice(1) + "**";

        if ( json.body.length > 1500 ) {
            objects.chatChannel.send( json.title );
            for (let i = 0; i < Math.ceil(json.body.length / 1500); i++) {
                objects.chatChannel.send( "> " + json.body.substring(i * 1500, (i+1) * 1500) ).then((message) => {
                    message.suppressEmbeds(true);
                });
            }
        } else {
            objects.chatChannel.send(json.title + "\n" + json.body).then((message) => {
                message.suppressEmbeds(true);
            });
        }
        
        // example
        let options = {
            host: "e621.net",
            port: 443,
            path: "/posts/random.json?tags=" + tag,
            method: "GET",
            headers: {
                "User-Agent": "MacBot/1.0 (by Yoyorony)"
            }
        };

        HTTPClient.requestJSON(options, objects, onResultExample, onError);
    }
}

function onResultExample( resultCode, json, objects ) {
    if ( resultCode !== 200)
        objects.chatChannel.send("Cannot fetch an example for this tag.");
    else {
        if ( !json || !json.post.id || !json.post.file.size || !json.post.file.ext ) {
            objects.chatChannel.send("Cannot fetch an example for this tag.");
            return;
        }

        try {
            if ( !json.post.sample.url || !json.post.file.url )
                objects.chatChannel.send("Example :\nCouldn't get the direct url. Here is a link to the post : https://e621.net/posts/" + json.post.id);
            else if ( json.post.file.ext === "swf" )
                objects.chatChannel.send("Example :\nThis is flash content click here to play it : https://e621.net/posts/" + json.post.id );
            else if ( parseInt(json.post.file.size) > maxSize )
                objects.chatChannel.send("Example :\nFile size is too large only a preview is shown. Post id : " + json.post.id,
                        {files: [json.post.sample.url]} );
            else 
                objects.chatChannel.send( "Example :\nPost id : " + json.post.id,
                        {files: [json.post.file.url]} );
        } catch(err) { objects.chatChannel.send("Cannot fetch an example for this tag."); }
    }
}

function onError( objects, json, err ) {
    console.log(err + ". JSON :\n" + JSON.stringify(json));
    objects.chatChannel.send("The site returned an error.\n"
            + "Looks like we got the dumbest person alive here !");
}

function checkLMC( chatChannel, tags ) {
    if ( !tags || !tags.toLowerCase().includes("les_mac_copains") )
        return false;
    chatChannel.send( "Post id : 2364054", {files: ["./tmp/YoyoronyMCnsfw.png"]} );
    return true;
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
exports.randomTag = randomTag;