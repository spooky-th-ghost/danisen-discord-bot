require('dotenv').config();
require('module-alias/register')
const { Client, GatewayIntentBits } = require('discord.js');
const { executeSlashCommands } = require('./commands');
const { handleReactions } = require('./reactions');
const { getConnectionPool, keepPoolAlive } = require('@utility/postgres');

const pool = getConnectionPool();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions
	],
	 partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  await executeSlashCommands(interaction, pool);
});

client.on('messageReactionAdd', async (messageReaction, user) => {
	const reaction = await messageReaction.fetch();
	await handleReactions(reaction, user);
});

client.login(process.env.TOKEN);

setInterval(async () => {
	await keepPoolAlive(pool);
}, 45000);
