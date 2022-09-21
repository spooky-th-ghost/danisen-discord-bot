require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { executeCommands } = require('./commands');
const axios = require('axios');
const appState = {
  currentPlayers: [],
  currentMatches: [],
  sessionIsActive: false,
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  await executeCommands(interaction, appState);
});

client.login(process.env.TOKEN);
