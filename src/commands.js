const moment = require('moment');

const {
  registerUser,
  doesUserExist,
  userHasFreeTeamSlot,
  getUserProfile,
  registerNewTeam
} = require('@repository/registration');

const { isSessionOpen } = require('@repository/matchmaking');

const profile = async (interaction, pool) => {
  await interaction.deferReply();
  let exists = await doesUserExist(interaction, pool);
  if (exists) {
    let userProfile = await getUserProfile(interaction, pool);
    let nameAndRankString = `${userProfile.username} | ${userProfile.rank} ${userProfile.points}`;
    let teamString = userProfile.teams.join('\n');
    await interaction.editReply(`${nameAndRankString} \n ${teamString}`);
  } else {
    await interaction.editReply('You need to register in order to view your profile...');
  }
}

const ready = async (interaction, pool) => {
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

const unready = async (interaction, pool) => {
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

const players = async (interaction, pool) => {
  await interaction.reply(JSON.stringify(appState.currentPlayers));
}

const session = async (interaction, pool) => {
  await interaction.deferReply();
  let data = await isSessionOpen(pool);
  let sessionStatus = data.variable_value ? 'OPEN' : 'CLOSED';
  let formattedDate = moment(data.last_changed).format('MMMM Do YYYY, h:mm:ss a');
  let response = `
    The Danisen session is currently ${sessionStatus},
    the session has been ${sessionStatus} since ${formattedDate}`;
  await interaction.editReply(response);
}

const register = async (interaction, pool) => {
  await interaction.deferReply();
  let exists = await doesUserExist(interaction, pool);
  if (exists) {
    await interaction.editReply('You have already registered')
  } else {
    await registerUser(interaction, pool);
    await interaction.editReply('You have successfully registered, call /register-team to register a team!');
  }
}

const registerTeam = async (interaction, pool) => {
  await interaction.deferReply();
  let hasSlot = await userHasFreeTeamSlot(interaction, pool);
  if (!hasSlot) {
    await interaction.editReply('You have no open team slots, call /profile to view your currently registered teams.')
  } else {
    let displayString = await registerNewTeam(interaction, pool);
    await interaction.editReply(`Team registered successfully! \n ${displayString}`);
  }
}

const executeCommands = async (interaction, pool) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  
  switch (commandName) {
    case 'profile':
      await profile(interaction, pool);
      break;
    case 'ready':
      await ready(interaction, pool);
      break;
    case 'unready':
      await unready(interaction, pool);
      break;
    case 'players':
      await players(interaction, pool);
      break;
    case 'session':
      await session(interaction, pool);
      break;
    case 'register':
      await register(interaction, pool);
      break;
    case 'register-team':
      await registerTeam(interaction, pool);
      break;
  }
}

module.exports = { executeCommands };
