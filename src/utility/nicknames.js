const updateNicknameWithRank = async (interaction, user, rank, points) => {
  try {
    let guildMember = await interaction.guild.members.fetch(user.id);
    let nickname = String(guildMember.displayName);
    let nameArray = nickname.split('|');
    let nicknameWithoutRank = nameArray[0].trim();
    if (nicknameWithoutRank.length > 22) nicknameWithoutRank = nicknameWithoutRank.substring(0, 19) + '...';
    let newNickname = nicknameWithoutRank + '|' + rank + (points < 0 ? '' : '+') + points;
    guildMember.setNickname(newNickname);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  updateNicknameWithRank
}
