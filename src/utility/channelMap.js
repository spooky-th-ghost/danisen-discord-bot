const guildChannelMap = {
	'1021970385446637598': { // Test
		challenge: '1023409057131921498',
		registration: '1023452640526483466',
	},
	'814790189217480734': { // Keninblack
		challenge: '835386934565666858',
		registration: '834286051194830890',
	},
	'878811708502736926': { // Mixmasters
		challenge: '1061793255945154560',
		registration: '1061789808038510632',
	},
};

const getChannelsByGuildId = (guildId) => {
	return guildChannelMap[guildId.toString()];
}

module.exports = {
	getChannelsByGuildId
}
