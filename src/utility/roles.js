const roles = [
	{name: '1st Dan', id: '1023276225717870676'},
	{name: '2nd Dan', id: '1023276769584889916'},
	{name: '3rd Dan', id: '1023276834135220234'},
	{name: '4th Dan', id: '1023276880280952965'},
	{name: '5th Dan', id: '1023276930004430919'},
	{name: '6th Dan', id: '1023276983003664454'},
	{name: '7th Dan', id: '102327703652297118'},
]

const updateRankRole = async (interaction, user, rankUpdate) => {
	const { oldRank, newRank} = rankUpdate;
	
	const member = await interaction.guild.members.fetch(user.id);
	
	const roleToRemove = roles.find(r => r.name == oldRank).id;
	const roleToAdd = roles.find(r => r.name == newRank).id;  
	
	member.roles.add(roleToAdd);
	member.roles.remove(roleToRemove);
	
	return;
}

module.exports = {
	roles,
	updateRankRole
}
