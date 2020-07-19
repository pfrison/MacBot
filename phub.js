const HTTPClient = require("./HTTPClient");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function randomPHub( chatChannel, tags ) {
    let options = {
        host: "www.pornhub.com",
        port: 443,
        method: "GET",
        headers: {
            "User-Agent": "MacBot/1.0 (by Yoyorony)"
        }
    };

    if ( tags ) {
        options.path = "/video/search?o=mr&search=" + tags;
    } else {
        options.path = "/video";
    }

    objects = {
        "chatChannel": chatChannel
    };

    HTTPClient.requestText(options, objects, onResult, onError);
}

function onResult( resultCode, html, objects ) {
    if ( resultCode === 404 )
        objects.chatChannel.send("You have so much disgusting tastes, it returned no result...\n"
                + "You make me sick you degenerate fuck.");
    else if ( resultCode !== 200) 
        onError( objects );
    else {
        const dom = new JSDOM(html);

        if ( !dom.window.document ) {
            onError( objects );
            return;
        }
        
        let list = dom.window.document.querySelector("#videoCategory");
        if ( !list ) {
            list = dom.window.document.querySelector("#videoSearchResult");
            if ( !list ) {
                onError( objects );
                return;
            }
        }

        // the first one is an ad
        let random = Math.floor((Math.random() * (list.children.length - 1)) + 1);

        let link = "https://www.pornhub.com" + list.children[random].querySelector("a").href.toString();
        objects.chatChannel.send(link);
    }
}

function onError( objects ) {
    objects.chatChannel.send("The site returned an error.\n"
            + "Looks like we got the dumbest person alive here !");
}

exports.randomPHub = randomPHub;