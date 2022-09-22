const { isSessionOpen } = require('./database');
const moment = require('moment');

const ping = async (interaction) => {
  await interaction.reply('Pong!');
}

const server = async (interaction) => {
  await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
}

const user = async (interaction) => {
  await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
}

const ranking = async (interaction) => {
  await interaction.reply(`Trash, go lab`);
}

const sheet = async (interaction) => {
  await interaction.reply(process.env.SPREADSHEET_URL);
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
  let data = await isSessionOpen();
  let sessionStatus = data.variable_value ? 'OPEN' : 'CLOSED';
  let formattedDate = moment(data.last_changed).format('MMMM Do YYYY, h:mm:ss a');
  let response = `
    The Danisen session is currently ${sessionStatus},
    the session has been ${sessionStatus} since ${formattedDate}`;
  await interaction.reply(response);
}

const executeCommands = async (interaction, appState) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  
  switch (commandName) {
    case 'ping':
      await ping(interaction);
      break;
    case 'server':
      await server(interaction);
      break;
    case 'user':
      await user(interaction);
      break;
    case 'ranking':
      await ranking(interaction);
      break;
    case 'sheet':
      await sheet(interaction);
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
  }
}

module.exports = { executeCommands };
