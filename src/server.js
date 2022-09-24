require('dotenv').config();
require('module-alias/register')
const { Client, GatewayIntentBits } = require('discord.js');
const { executeCommands } = require('./commands');
const { getConnectionPool, keepPoolAlive } = require('@utility/postgres');

const pool = getConnectionPool();

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
  await executeCommands(interaction, pool);
});

client.login(process.env.TOKEN);

setInterval(async () => {
	console.log('Pinging DB to keep the pool alive');
	await keepPoolAlive(pool);
}, 45000);
