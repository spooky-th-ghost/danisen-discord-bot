const moment = require('moment');

const {
  registerUser,
  doesUserExist,
  userHasFreeTeamSlot,
  getUserProfile,
  registerNewTeam,
  reRegisterExistingTeam
} = require('@repository/registration');

const {
  isSessionOpen,
  setStatusToMatching,
  setStatusToDormant
} = require('@repository/matchmaking');

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
  interaction.deferReply();
  let statusAlreadySet = await setStatusToMatching(interaction, pool);
  if (statusAlreadySet) {
    await interaction.editReply(`You were already in matchmaking`);
  } else {
    await interaction.editReply(`You have been entered into matchmaking`);
  }
}

const unready = async (interaction, pool) => {
  interaction.deferReply();
  let statusAlreadySet = await setStatusToDormant(interaction, pool);
  if (statusAlreadySet) {
    await interaction.editReply(`You were already not in matchmaking`);
  } else {
    await interaction.editReply(`You have been removed from matchmaking`);
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

const reRegisterTeam = async (interaction, pool) => {
  await interaction.deferReply();
  let displayString = await reRegisterExistingTeam(interaction, pool);
  await interaction.editReply(displayString);
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
    case 're-register-team':
      await reRegisterTeam(interaction, pool);
      break;
  }
}

module.exports = { executeCommands };
