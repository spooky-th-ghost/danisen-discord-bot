const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
require('dotenv').config();
const { CharacterChoices } = require('./src/utility/characterCodes');
const { RankChoices, PointChoices } = require('./src/utility/rank');

let clientId = process.env.CLIENT_ID;
let guildId = process.env.GUILD_ID;
let token = process.env.TOKEN;

const commands = [
  new SlashCommandBuilder().setName('profile').setDescription('Show your current ranking'),
  new SlashCommandBuilder().setName('session').setDescription('Display whether the Danisen league is currently in session'),
  new SlashCommandBuilder().setName('standings').setDescription('Output a list of the current standings (formatted for Google Sheets)'),
  new SlashCommandBuilder().setName('register').setDescription('Register for the Danisen league'),
  new SlashCommandBuilder().setName('register-team')
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
  new SlashCommandBuilder()
    .setName('re-register-team')
    .setDescription('Re-register one of your teams')
    .addStringOption(option => 
      option.setName('slot')
        .setDescription('The slot you want to re-register')
        .setRequired(true)
        .addChoices(
          { name: '1', value: 'team1' },
          { name: '2', value: 'team2' },
          { name: '3', value: 'team3' }
        )
    )
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
    // new SlashCommandBuilder()
    // .setName('report-match')
    // .setDescription('Report the outcome of your danisen match')
    // .addIntegerOption(option => 
    //   option.setName('your-win-count')
    //     .setDescription('Your score for the set')
    //     .setRequired(true)
    //     .addChoices(
    //       {name: '0', value: 0},
    //       {name: '1', value: 1},
    //       {name: '2', value: 2},
    //       {name: '3', value: 3},
    //     )
    // )
    // .addUserOption(option => 
    //   option.setName('opponent')
    //     .setDescription('The player you played against')
    //     .setRequired(true)
    // )
    // .addIntegerOption(option => 
    //   option.setName('opponent-win-count')
    //     .setDescription('Your opponents score for the set')
    //     .setRequired(true)
    //     .addChoices(
    //       {name: '0', value: 0},
    //       {name: '1', value: 1},
    //       {name: '2', value: 2},
    //       {name: '3', value: 3},
    //     )      
    // ),
	new SlashCommandBuilder()
		.setName('challenge')
		.setDescription("Challenge a player to a danisen match, only works in the 'challenges' channel")
		.addUserOption(option => 
      option.setName('opponent')
        .setDescription('The player you want to challenge')
        .setRequired(true)
  ),
  new SlashCommandBuilder().setName('set-rank').setDescription("Manually set a players rank")
    .addStringOption(option => 
      option.setName('rank')
        .setDescription("The rank to assign the player")
        .setRequired(true)
    	.addChoices(...RankChoices))
    .addStringOption(option =>
      option.setName('points')
      	.setDescription("The points this player has at this rank")
      	.setRequired(true)
      	.addChoices(...PointChoices))
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
