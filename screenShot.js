const screenshot = require("screenshot-desktop");
const fs = require("fs");

const location = "./tmp/screenShot.png";

function takeScreenShot(callback) {
    screenshot({ filename: location }).then(callback);
}

function clean() {
    fs.unlinkSync(location);
}

exports.takeScreenShot = takeScreenShot;
exports.clean = clean;