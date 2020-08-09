const guildId = "694551193061687346";
const nsfwChannelId = "736994168668422204";
const teletravailChannelId = "702527101995057232";
const { TextChannel, DMChannel } = require("discord.js");

var nsfwChannel;
var teletravailChannel;
var allGuildChannels;
var allDMChannels = [];
var client;

function initChannels(discordClient) {
    client = discordClient;
}

function refreshChannels() {
    allGuildChannels = client.guilds.cache.get(guildId).channels.cache;

    let tmp = allGuildChannels.get(nsfwChannelId);
    if ( tmp && tmp instanceof TextChannel )
        nsfwChannel = tmp;

    let tmp2 = allGuildChannels.get(teletravailChannelId);
    if ( tmp2 && tmp2 instanceof TextChannel )
        teletravailChannel = tmp2;
}

function cacheDMMessages() {
    allDMChannels = [];
    let allUsers = client.users.cache.array();

    let fetched = allUsers.length;
    for (let i=0; i<allUsers.length; i++) {
        allUsers[i].fetch().then((user) => {
            if ( user.dmChannel )
                allDMChannels.push(user.dmChannel);
        }).finally(() => {
            fetched -= 1;
            // all fetched or failed
            if (fetched === 0) {
                for (let i=0; i<allDMChannels.length; i++) {
                    let channel = allDMChannels[i];
                    if (channel.messages)
                        channel.messages.fetch({ limit: 10 });
                }
            }
        });
    }
}

function getNSFWChannel() { return nsfwChannel; }
function getTeletravailChannel() { return teletravailChannel; }
function getAllChannels() { return allGuildChannels; }

exports.getNSFWChannel = getNSFWChannel;
exports.getTeletravailChannel = getTeletravailChannel;
exports.getAllChannels = getAllChannels;
exports.refreshChannels = refreshChannels;
exports.cacheDMMessages = cacheDMMessages;
exports.initChannels = initChannels;

exports.nsfwChannelId = nsfwChannelId;