// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
var request = require('request-promise-native');

class AnimeBot extends ActivityHandler {
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const query = context.activity.text;

            // Fetch information about the anime from the Jikan API v4
            const animeData = await request({
                uri: `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`,
                json: true
            });

            if (!animeData.data.length) {
                await context.sendActivity('Sorry, I could not find any information about that anime.');
            } else {
                const anime = animeData.data;
        
                for (const an of anime) {
                    const response = `Here is what I found about ${an.title}:\n\n` +
                            `Synopsis: ${an.synopsis}\n\n` +
                            `Type: ${an.type}\n\n` +
                            `Episodes: ${an.episodes}\n\n` +
                            `Score: ${an.score}/10\n\n` +
                            `Rated: ${an.rating}\n\n` +
                            `Genres: ${an.genres.map(g => g.name).join(', ')}\n\n` +
                            `More info: ${an.url}`;
                    await context.sendActivity(response);
                }
            }

            const welcomeText = 'Do you want to look for some more anime? Please provide the name.';
            await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello, which anime do you want to search for information?';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.AnimeBot = AnimeBot;
