const { ChannelType } = require('discord.js');
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
  setStatusToDormant,
	canPlayersFight,
	matchWithinThreshhold,
  reportScore
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

const reportMatch = async (interaction, pool) => {
  await interaction.deferReply();
  let matchResponse = await reportScore(interaction, pool);
  await interaction.editReply(matchResponse);
}

const challenge = async (interaction, pool) => {
	await interaction.deferReply();
	const challenger = interaction.user;
  const opponent = interaction.options.getUser('opponent');
	
	const canFight = await canPlayersFight(challenger, opponent, pool);
	const isDanisenSessionOpen = await isSessionOpen(pool);
	const isMatchWithinThreshhold = await matchWithinThreshhold(challenger, opponent, pool);
	
	if (!isDanisenSessionOpen) {
		await interaction.editReply('Danisen session is not currently open');	
	} else if (!canFight) {
		await interaction.editReply('Players ranks are too far apart to play each other');	
	} else if (isMatchWithinThreshhold) {
		await interaction.editReply('You have played this player to recently');
	} else {
		const thread = await interaction.channel.threads.create({
			name: `${challenger.username} v ${opponent.username}`,
			autoArchiveDuration: 60,
			reason: 'Matching',
		});

		thread.members.add(challenger);
		thread.members.add(opponent);
		await thread.send(`Match thread between ${challenger.username} and ${opponent.username}, to share a lobby link, say GG etc, feel free to call /report-match in here when you're done`);
		await interaction.editReply('Match thread created');
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
    case 're-register-team':
      await reRegisterTeam(interaction, pool);
      break;
    case 'report-match':
      await reportMatch(interaction, pool);
      break;
		case 'challenge':
			await challenge(interaction, pool);
			break;
  }
}

module.exports = { executeCommands };
