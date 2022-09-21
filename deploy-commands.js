const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
require('dotenv').config();

let clientId = process.env.CLIENT_ID;
let guildId = process.env.GUILD_ID;
let token = process.env.TOKEN;

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
  new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
  new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
  new SlashCommandBuilder().setName('report').setDescription('Report a win'),
  new SlashCommandBuilder().setName('ranking').setDescription('Show your current ranking'),
  new SlashCommandBuilder().setName('sheet').setDescription('The Danisen Ranking sheet'),
  new SlashCommandBuilder().setName('ready').setDescription('Enter Matchmaking'),
  new SlashCommandBuilder().setName('unready').setDescription('Remove yourself from the matchmaking pool'),
  new SlashCommandBuilder().setName('players').setDescription('Display the users in matchmaking')
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
