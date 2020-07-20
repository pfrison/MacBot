const screenshot = require("screenshot-desktop");
const fs = require("fs");

const location = "./tmp/screenShot.png";

function takeScreenShot(chatChannel) {
    screenshot({ filename: location }).then((imagePath) => {
        chatChannel.send( {files: [imagePath]} ).then(() => {
            if (fs.existsSync(imagePath))
                fs.unlinkSync(imagePath);
        });
    });
}

function clean() {
    if (fs.existsSync(location))
        fs.unlinkSync(location);
}

exports.takeScreenShot = takeScreenShot;
exports.clean = clean;