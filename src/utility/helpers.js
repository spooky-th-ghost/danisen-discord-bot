const getUserByDiscordId = async (interaction, id) => {
  let member = await interaction.guild.members.fetch(id);
  return member.user;
}

const extractModalFields = (interaction) => {
    let rawModalFields = [...interaction.fields.fields.values()].map(v => {
    let rawId = v.customId.split('_');
    let fieldName = rawId[0] // name of the field
    let userId = rawId[1];
    let score = v.value;
    let returnObject = {};

    let designation = fieldName.split('-')[0];
    let designationField = `${designation}Id`;
    returnObject[fieldName] = score;
    returnObject[designationField] = userId;
    return returnObject;
  });
  let modalFields = { ...rawModalFields[0], ...rawModalFields[1] }
  return modalFields;
}

    
module.exports = {
  getUserByDiscordId,
  extractModalFields
}
