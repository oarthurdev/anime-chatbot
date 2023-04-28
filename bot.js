// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
var request = require('request-promise-native');
async function fetchAnimeData(query) {
    return request({
        uri: `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`,
        json: true
    });
}
class AnimeBot extends ActivityHandler {
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const query = context.activity.text;
            
            let animeData;
            
            try {
                animeData = await fetchAnimeData(query);
            } catch (error) {
                console.error(error);
                await context.sendActivity('Sorry, an error occurred while fetching the anime data.');
                return;
            }
            
            if (!animeData.data.length) {
                await context.sendActivity('Sorry, I could not find any information about that anime.');
            } else {
                const anime = animeData.data;
        
                anime.map(an => {
                    const response = `Here is what I found about ${an.title}:\n\n` +
                        `${an.synopsis ? `Synopsis: ${an.synopsis}\n\n` : ''}` +
                        `${an.type ? `Type: ${an.type}\n\n` : ''}` +
                        `${an.episodes ? `Episodes: ${an.episodes}\n\n` : ''}` +
                        `${an.score ? `Score: ${an.score}/10\n\n` : ''}` +
                        `${an.rating ? `Rated: ${an.rating}\n\n` : ''}` +
                        `${an.genres && an.genres.length ? `Genres: ${an.genres.map(g => g.name).join(', ')}\n\n` : ''}` +
                        `More info: ${an.url}`;
                    return context.sendActivity(response);
                });
            }

            const inputSearchAnime = 'Do you want to look for some more anime? Please provide the name.';
            await context.sendActivity(MessageFactory.text(`${inputSearchAnime}`));

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
