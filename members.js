const guildId = "694551193061687346";
const roleId = "702797453363249203";

var allMembers;
var allVerifiedMembers;
var client;

function initMembers(discordClient) {
    client = discordClient;
}

function refreshMembers() {
    allMembers = client.guilds.cache.get(guildId).members.cache;
    allVerifiedMembers = allMembers.filter((member) => {
        if ( member.roles.cache.get(roleId) ) return true;
        else return false;
    });
}

function getAllVerifiedMembers() { return allVerifiedMembers; }
function getAllMembers() { return allMembers; }

exports.getAllVerifiedMembers = getAllVerifiedMembers;
exports.getAllMembers = getAllMembers;
exports.refreshMembers = refreshMembers;
exports.initMembers = initMembers;