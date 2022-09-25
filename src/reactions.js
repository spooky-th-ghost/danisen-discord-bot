

const challengeReaction = async (reaction, user) => {
  const messageReacted = reaction.message;
  const messageChannel = messageReacted.channel;
  const [opponent, challenger] = [...messageReacted.mentions.users.values()];

  console.log(reaction.emoji);
  if (opponent.id == user.id) {
    if (reaction.emoji.name == '✅') {
      await createChallengeThread(messageChannel, challenger, opponent);
    } else if (reaction.emoji.name == '🚫') {
      await messageReacted.reply(`${opponent.username} has rejected the challenge.`);
    }
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
	await thread.send(`Match thread between ${challenger.username} and ${opponent.username}, to share a lobby link, say GG etc, feel free to call /report-match in here when you're done`);
}

const handleReactions = async (reaction, user) => {
  if (user.id == process.env.CLIENT_ID) return;

  await challengeReaction(reaction, user);
}

module.exports = {
  handleReactions
}
