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
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

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
    const channel = await interaction.guild.channels.fetch(process.env.CHALLENGE_CHANNEL_ID);
    const message = await channel.send({
      "content": `${opponent}, ${challenger} has challenged you to play a danisen match, react to this message to accept or deny`,
      "components": [
          {
              "type": 1,
              "components": [
                  {
                      "type": 2,
                      "label": "Accept",
                      "style": 3,
                      "custom_id": "accept-challenge"
                  },
                  {
                      "type": 2,
                      "label": "Deny",
                      "style": 4,
                      "custom_id": "deny-challenge"
                  }
              ]

          }
      ],
      'ephemeral': true
    })
		await interaction.editReply('Administering Challenge');
	}
}

const challengeAccepted = async (interaction) => {
  const message = interaction.message;
  const messageChannel = interaction.message.channel;
  const [opponent, challenger] = [...message.mentions.users.values()];

  if (opponent.id == interaction.user.id) {
    await createChallengeThread(messageChannel, challenger, opponent);
  }
}
const challengeDenied = async (interaction) => {
  const message = interaction.message;
  const [opponent] = [...message.mentions.users.values()];
  if (opponent.id == interaction.user.id) {
    await message.reply(`${opponent.username} has rejected the challenge.`);
  }
}

const createChallengeThread = async (channel, challenger, opponent) => {
  const thread = await channel.threads.create({
    name: `${challenger.username} v ${opponent.username}`,
    autoArchiveDuration: 60,
    reason: 'Matching',
	});

	thread.members.add(challenger);
  thread.members.add(opponent);
  let challengeThreadMessage = {
    'content': `${challenger} and ${opponent} You can use this thread to talk, share a lobby, etc. and the n report your scores below`,
      "components": [
        {
            "type": 1,
            "components": [
            {
              'type': 2,
              'style': 4,
              'label': 'Report Scores',
              'custom_id': `score-report_${challenger.id}_${opponent.id}`
              }
            ]

        }
    ]
  }
	await thread.send(challengeThreadMessage);
}

const scoreReportModal = async (interaction, challengerId, oponentId) => {
  let challengerMember = await interaction.guild.members.fetch(challengerId);
  let opponentMember = await interaction.guild.members.fetch(oponentId);
  let challenger = challengerMember.user;
  let opponent = opponentMember.user;

  const modal = {
    'title': 'Report Scores',
    'custom_id': 'report-modal',
    'components': [
      {
        'type': 1,
        'components': [
          scoreReportInput(challenger, 'challenger')
        ]
      },
      {
        'type': 1,
        'components': [
          scoreReportInput(opponent, 'opponent')
        ]
      }
    ]
  }

  await interaction.showModal(modal);
  // new ModalBuilder()
  //   .setCustomId('report-modal')
  //   .setTitle('Report Scores');
  
  // let firstRow = new ActionRowBuilder().addComponents(scoreReportInput(challenger, 'challenger'));
  // let secondRow = new ActionRowBuilder().addComponents(scoreReportInput(opponent, 'opponent'));
  
}

const scoreReportInput = (user, userType) => {
  return {
    type: 4,
    custom_id: `${userType}-score`,
    label: `${user.username} score`,
    style: '1',
    min_length: 1,
    max_length: 1,
    placeholder: '0'
  }
}


const buttonInteractions = async (interaction, pool) => {
  switch (interaction.customId) {
    case 'accept-challenge':
      await challengeAccepted(interaction);
      break;
    case 'deny-challenge':
      await challengeDenied(interaction);
      break;
  }

  if (interaction.customId.startsWith('score-report')) {
    let rawId = interaction.customId.split('_');
    let challengerId = rawId[1];
    let opponentId = rawId[2];
    await scoreReportModal(interaction, challengerId, opponentId);
  }
}

const executeSlashCommands = async (interaction, pool) => {
  const { commandName } = interaction;
  const challengeChannel = ((interaction.channel.type == 0 && interaction.channel.id == process.env.CHALLENGE_CHANNEL_ID) || (interaction.channel.type == 11 && interaction.channel.parentId == process.env.CHALLENGE_CHANNEL_ID));
  const registrationChannel = interaction.channel.id == process.env.REGISTRATION_CHANNEL_ID;
  
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
      if (registrationChannel) {
        await register(interaction, pool);
      } else {
        await interaction.reply("Command ignored, you can call registration commands in the 'registration' channel");
      }
      break;
    case 'register-team':
      if (registrationChannel) {
        await registerTeam(interaction, pool);
      } else {
        await interaction.reply("Command ignored, you can call registration commands in the 'registration' channel");
      }
      break;
    case 're-register-team':
      if (registrationChannel) {
        await reRegisterTeam(interaction, pool);
      } else {
        await interaction.reply("Command ignored, you can call registration commands in the 'registration' channel");
      }
        break;
    case 'report-match':
      if (challengeChannel) {
        await reportMatch(interaction, pool);
      } else {
        await interaction.reply("Command ignored, you can only report scores in the 'challenges' channel");
      }
      break;
    case 'challenge':
      if (challengeChannel) { 
        await challenge(interaction, pool);
      } else {
        await interaction.reply("Command ignored, you can only challenge players in the 'challenges' channel");
      }
			break;
  }
}

const handleInteractions = async (interaction, pool) => {
  if (interaction.isChatInputCommand()) {
    await executeSlashCommands(interaction, pool);
  }

  if (interaction.isButton()) {
    await buttonInteractions(interaction, pool);
  }

  if (interaction.isModalSubmit()) {

  }
}

module.exports = { handleInteractions };
