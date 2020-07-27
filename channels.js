const { DiscordAPIError } = require("discord.js");

const guildId = "694551193061687346";
const channelId = "702527101995057232";
const { TextChannel } = require("discord.js");

var teletravailChannel;
var allChannels;
var client;

function initChannels(discordClient) {
    client = discordClient;
}

function refreshChannels() {
    allChannels = client.guilds.cache.get(guildId).channels.cache;

    let tmp = allChannels.get(channelId);
    if ( tmp && tmp instanceof TextChannel )
        teletravailChannel = tmp;
}

function getTeletravailChannel() { return teletravailChannel; }
function getAllChannels() { return allChannels; }

exports.getTeletravailChannel = getTeletravailChannel;
exports.getAllChannels = getAllChannels;
exports.refreshChannels = refreshChannels;
exports.initChannels = initChannels;