const {
  isSessionOpen,
  registerUser,
  doesUserExist,
  userHasFreeTeamSlot,
  getUserProfile,
  registerNewTeam
} = require('./database');

const { CharacterCodes} = require('./character_codes');
const moment = require('moment');

const profile = async (interaction) => {
  await interaction.deferReply();
  let exists = await doesUserExist(interaction);
  if (exists) {
    let userProfile = await getUserProfile(interaction);
    let nameAndRankString = `${userProfile.username} | ${userProfile.rank} ${userProfile.points}`;
    let teamString = userProfile.teams.join('\n');
    await interaction.editReply(`${nameAndRankString} \n ${teamString}`);
  } else {
    await interaction.editReply('You need to register in order to view your profile...');
  }
}

const ready = async (interaction, appState) => {
  let username = interaction.user.username;
  if (!appState.currentPlayers.some(cp => cp.username == username)) {
    appState.currentPlayers.push({
      username,
      status: 'matching',
      alreadyPlayed: []
    });
    await interaction.reply(`You have been entered into matchmaking ${username}`);
  } else {
    let myIndex = appState.currentPlayers.findIndex(cp => cp.username == username);
    if (myIndex != -1) {
      let myEntry = { ...appState.currentPlayers[myIndex] };
      myEntry.status = 'matching';
      appState.currentPlayers.splice(myIndex,1);
      appState.currentPlayers.push(myEntry);
    }
    await interaction.reply(`You have been entered into matchmaking ${username}`);
  }
}

const unready = async (interaction, appState) => {
  let username = interaction.user.username;
  let myIndex = appState.currentPlayers.findIndex(cp => cp.username == username);

  if (myIndex == -1) {
    await interaction.reply(`You weren't in matchmaking ${username}`);
  } else {
    let myEntry = { ...appState.currentPlayers[myIndex] };
    myEntry.status = 'not matching';
    appState.currentPlayers.splice(myIndex,1);
    appState.currentPlayers.push(myEntry);
    await interaction.reply(`You were removed from matchmaking ${username}`);
  }
}

const players = async (interaction, appState) => {
  await interaction.reply(JSON.stringify(appState.currentPlayers));
}

const session = async (interaction, appState) => {
  await interaction.deferReply();
  let data = await isSessionOpen();
  let sessionStatus = data.variable_value ? 'OPEN' : 'CLOSED';
  let formattedDate = moment(data.last_changed).format('MMMM Do YYYY, h:mm:ss a');
  let response = `
    The Danisen session is currently ${sessionStatus},
    the session has been ${sessionStatus} since ${formattedDate}`;
  await interaction.editReply(response);
}

const register = async (interaction, appState) => {
  await interaction.deferReply();
  let exists = await doesUserExist(interaction);
  if (exists) {
    await interaction.editReply('You have already registered')
  } else {
    await registerUser(interaction);
    await interaction.editReply('You have successfully registered, call /register-team to register a team!');
  }
}

const registerTeam = async (interaction, appState) => {
  await interaction.deferReply();
  let hasSlot = await userHasFreeTeamSlot(interaction);
  if (!hasSlot) {
    await interaction.editReply('You have no open team slots, call /profile to view your currently registered teams.')
  } else {
    let displayString = await registerNewTeam(interaction);
    await interaction.editReply(`Team registered successfully! \n ${displayString}`);
  }
}

const executeCommands = async (interaction, appState) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  
  switch (commandName) {
    case 'profile':
      await profile(interaction);
      break;
    case 'ready':
      await ready(interaction, appState);
      break;
    case 'unready':
      await unready(interaction, appState);
      break;
    case 'players':
      await players(interaction, appState);
      break;
    case 'session':
      await session(interaction, appState);
      break;
    case 'register':
      await register(interaction, appState);
      break;
    case 'register-team':
      await registerTeam(interaction, appState);
      break;
  }
}

module.exports = { executeCommands };
