var Discord = require('discord.js');
var auth = require('./auth.json');
var request = require('request');
var fs = require('fs');

var channelID;

const cheerio = require('cheerio');

var state = require('./state.json');
var siteContent;



// Initialize Discord Bot
var client = new Discord.Client();

client.on('ready', function (evt) {
    console.log("Connected");

    for (var channel in client.channels) {
        if (bot.channels[channel].name == "diplomacy") {
            channelID = channel;
            break;
        }
    }

    httpGet(function (response) {
        console.log("site set");
        siteContent = response;

        const $ = cheerio.load(siteContent);

        //checking if the data is current
        if (state.Date.replace("-", ", ") != $('span.gameDate').text().replace) {
            state.Date = $('span.gameDate').text();
            botSendMessage("Date is now " + state.Date);

            const members = $('div.membersFullTable tbody').children();

            //fs.writeFile('state.json', JSON.stringify(state, null, 2), 'utf8', function (err) {
            //    if (err) throw err;
            //    console.log('complete');
            //});
        }

    });




});

client.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch (cmd) {
            // !ping
            case 'ping':
                botSendMessage("pong");
                // Just add any case commands if you want to..
                break;
            case 'site':
                console.log(siteContent);
                break;
        }
    }
});


function botSendMessage(m) {
    client.sendMessage({
        to: channelID,
        message: m
    });
}



function httpGet(callback) {
    request("https://webdiplomacy.net/board.php?gameID=236023", function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(body);
        }
    });

}


client.login(auth.token);

