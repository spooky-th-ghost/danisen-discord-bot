require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { handleInteractions } = require('./commands');
const { getConnectionPool, keepPoolAlive } = require('@utility/postgres');

const pool = getConnectionPool();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions
	]
});


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  await handleInteractions(interaction, pool);
});

client.on("message", function(message){

});

client.login(process.env.TOKEN);

setInterval(async () => {
	console.log('Pinging db to keep the pool alive');
	await keepPoolAlive(pool);
}, 45000);
