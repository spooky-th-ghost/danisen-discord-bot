const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
require('dotenv').config();
const { CharacterChoices } = require('./src/character_codes');

let clientId = process.env.CLIENT_ID;
let guildId = process.env.GUILD_ID;
let token = process.env.TOKEN;

const commands = [
  new SlashCommandBuilder().setName('report').setDescription('Report a win'),
  new SlashCommandBuilder().setName('profile').setDescription('Show your current ranking'),
  new SlashCommandBuilder().setName('ready').setDescription('Enter Matchmaking'),
  new SlashCommandBuilder().setName('unready').setDescription('Remove yourself from the matchmaking pool'),
  new SlashCommandBuilder().setName('players').setDescription('Display the users in matchmaking'),
  new SlashCommandBuilder().setName('session').setDescription('Display whether the Danisen league is currently in session'),
  new SlashCommandBuilder().setName('register').setDescription('Register for the Danisen league'),
  new SlashCommandBuilder()
    .setName('register-team')
    .setDescription('Register a team')
    .addStringOption(option =>
      option.setName('char1')
        .setDescription('The first character on your team')
        .setRequired(true)
        .addChoices(...CharacterChoices)
    )
    .addStringOption(option =>
      option.setName('char2')
        .setDescription('The first character on your team')
        .setRequired(false)
        .addChoices(...CharacterChoices)
    )
      .addStringOption(option =>
      option.setName('char3')
        .setDescription('The first character on your team')
        .setRequired(false)
        .addChoices(...CharacterChoices)
    ),
  new SlashCommandBuilder().setName('re-register-team-1').setDescription('Re Register your team in slot 1'),
  new SlashCommandBuilder().setName('re-register-team-2').setDescription('Re Register your team in slot 2'),
  new SlashCommandBuilder().setName('re-register-team-3').setDescription('Re Register your team in slot 3'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
