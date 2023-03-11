const moment = require('moment');
const { updateRankRole } = require('@utility/roles');
const { getUserByDiscordId, extractModalFields } = require('@utility/helpers');

const isSessionOpen = async (pool) => {
  try {
    const res = await pool.query(`
      select 
        cf.variable_value,
        cf.last_changed 
      from 
        config_flags cf 
      where
        cf.variable_name = 'session_open';
    `);
    let data = JSON.stringify(res.rows[0]);
    return data;
  } catch (err) {
    console.log(err.stack)
  }
}

const isPlayerMatching = async (interaction, pool) => {
  const res = await pool.query(`
    select 
      current_status = 'matching' as value 
    from 
      danisen_user du  
    where du.discord_id = $1 
    limit 1;
  `, [interaction.user.id]);

  return rows[0].value;
}

const setStatusToMatching = async (interaction, pool) => {
  let isMatching = await isPlayerMatching(interaction, pool);
  if (isMatching) {
    return true;
  }
  const res = await pool.query(`
    update danisen_user 
    set current_status = 'matching' 
    where discord_id = $1
  `, [interaction.user.id]);

  return false;
}

const setStatusToDormant = async (interaction, pool) => {
  let isMatching = await isPlayerMatching(interaction, pool);
  if (!isMatching) {
    return true;
  }
  const res = await pool.query(`
    update danisen_user 
    set current_status = 'dormant' 
    where discord_id = $1
  `, [interaction.user.id]);

  return alreadySet;
}

const canPlayersFight = async (user1, user2, pool) => {
  const res = await pool.query(`
  select
    rank
  from
    danisen_user
  where
    discord_id in ($1, $2)
  `, [user1.id, user2.id]);

  const ranks = res.rows.map(r => r.rank);

  const [rank1, rank2] = ranks;

  if (rank1 == null || rank2 == null) {
    return false;
  }

  if (rank2 == rank1) return true;

  switch (rank1) {
    case '1st Dan':
      return (rank2 == '2nd Dan');
    case '2nd Dan':
      return (rank2 == '1st Dan' || rank2 == '3rd Dan');
    case '3rd Dan':
      return (rank2 == '2nd Dan' || rank2 == '4th Dan');
    case '4th Dan':
      return (rank2 == '3rd Dan' || rank2 == '5th Dan');
    case '5th Dan':
      return (rank2 == '4th Dan' || rank2 == '6th Dan');
    case '6th Dan':
      return (rank2 == '5th Dan' || rank2 == '7th Dan');
    case '7th Dan':
      return (rank2 == '6th Dan' || rank2 == 'Strong');
    case 'Strong':
      return (rank2 == '7th Dan' || rank2 == 'Valor');
    case 'Valor':
      return (rank2 == 'Strong' || rank2 == 'Royal');
    case 'Royal':
      return (rank2 == 'Valor' || rank2 == 'Emperor');
    case 'Emperor':
      return (rank2 == 'Royal' || rank2 == 'Lord');
    case 'Lord':
      return (rank2 == 'Emperor');
  }

}

const matchWithinThreshhold = async (user1, user2, pool) => {
  const res = await pool.query(`
    select 
      match_date 
    from 
      danisen_match
    where 
      (player_1_discord_id = $1 and player_2_discord_id = $2)
    or
      (player_2_discord_id = $2 and player_1_discord_id = $1)
    order by 
      match_date desc
    limit 1
  `, [user1.id, user2.id]);

  if (res.rows.length == 0) return false;
  
  const matchDate = res.rows[0].match_date;
  const hourDiff = moment().diff(moment(matchDate), 'hours');

  /// Uncomment this line to actually check when the last match happened, currently turned off for testing
  //return hourDiff > parseInt(process.env.MATCH_HOURS_THRESHHOLD);
  return false;
}

const getRankData = async (user, pool) => {
  const res = await pool.query(`
    select 
      rank, 
      points 
    from danisen_user du
    where du.discord_id = $1
    limit 1
  `, [user.id]);

  if (res.rows.length == 0) {
    return null;
  }

  const rank = res.rows[0].rank;
  const points = res.rows[0].points;

  return {
    rank,
    points
  }
}

const increaseRank = (rank) => {
  switch (rank) {
    case '1st Dan':
      return '2nd Dan';
    case '2nd Dan':
      return '3rd Dan';
    case '3rd Dan':
      return '4th Dan';
    case '4th Dan':
      return '5th Dan';
    case '5th Dan':
      return '6th Dan';
    case '6th Dan':
      return '7th Dan';
    case '7th Dan':
      return 'Strong';
    case 'Strong':
      return 'Valor';
    case 'Valor':
      return 'Royal';
    case 'Royal':
      return 'Emperor';
    case 'Lord':
      return rank;
  }
}

const decreaseRank = (rank) => {
  switch (rank) {
    case '1st Dan':
      return rank;
    case '2nd Dan':
      return '1st Dan';
    case '3rd Dan':
      return '2nd Dan';
    case '4th Dan':
      return '3rd Dan';
    case '5th Dan':
      return '4th Dan';
    case '6th Dan':
      return '5th Dan';
    case '7th Dan':
      return '6th Dan';
    case 'Strong':
      return '7th Dan';
    case 'Valor':
      return 'Strong';
    case 'Royal':
      return 'Valor';
    case 'Emperor':
      return 'Royal';
    case 'Lord':
      return 'Emperor';
  }
}

const updateNicknameWithRank = (interaction, user, rank, points) => {
  interaction.guild.members.fetch(user.id).then(guildMember => {
	let nickname = String(guildMember.displayName);
  	let nameArray = nickname.split('|');
  	let nicknameWithoutRank = nameArray[0].trim();
  	if(nicknameWithoutRank.length > 25)
  		nicknameWithoutRank = nicknameWithoutRank.substring(0, 19) + '...';
  	let newNickname = nicknameWithoutRank + ' | ' + rank + (points < 0 ? '' : '+') + points;
  	guildMember.setNickname(newNickname);
  }).catch(console.error);
}

const manualSetRank = async (interaction, pool) => {
  const player = interaction.user;
  let { rank, points } = await getRankData(player, pool);
  let oldRank = rank;
  let oldPoints = points;
  let newRank = interaction.options.getString('rank');
  let newPoints = interaction.options.getString('points');
  let changedRank = oldRank === newRank && parseInt(oldPoints) === parseInt(newPoints) ? false : true;

  if(!changedRank)
  	return "Rank not changed.  New rank matches the existing rank."

  let query = 
    `
      update danisen_user set points = $2, rank = $3
      where discord_id = $1
    `;
  
  let values = [player.id, newPoints, newRank];

  
  const res = await pool.query(query, values);

  if (changedRank) {
	let rankUpdate = {
		oldRank,
		newRank
	}

	//updateRankRole(interaction, user, rankUpdate); 
  }

  updateNicknameWithRank(interaction, player, newRank, newPoints);
  return "Rank for " + player.username + " has been updated from " + oldRank +
  	(parseInt(oldPoints) >= 0 ? " +" : " ") + oldPoints + " to " + newRank +
  	(parseInt(newPoints) >= 0 ? " +" : " ") + newPoints + ".";
}

const reportWin = async (user, pool, interaction) => {
  let { rank, points } = await getRankData(user, pool);
  let changedRank = false;
	let newRank;

  points += 1;
  if (points > 2) {
    changedRank = true;
    points = 0;
    newRank = increaseRank(rank);
  }

  let query = changedRank
    ? `
      update danisen_user set points = $2, rank = $3
      where discord_id = $1
    `
    : `
      update danisen_user set points = $2
      where discord_id = $1
    `;
  
  let values = changedRank
    ? [user.id, points, newRank]
    : [user.id, points];

  
  const res = await pool.query(query, values);

	if (changedRank) {
		let rankUpdate = {
			oldRank: rank,
			newRank
		}

		//updateRankRole(interaction, user, rankUpdate); 
	}

  updateNicknameWithRank(interaction, user, changedRank ? newRank : rank, points);
}

const reportLoss = async (user, pool, interaction) => {
  let { rank, points } = await getRankData(user, pool);
  let changedRank = false;
  let newRank;

	points -= 1;
  if (rank == '1st Dan' && points < 0) {
    return ''
  }

  if (points < -2) {
    changedRank = true;
    points = 0;
    newRank = decreaseRank(rank);
  }

  let query = changedRank
    ? `
      update danisen_user set points = $2, rank = $3
      where discord_id = $1
    `
    : `
      update danisen_user set points = $2
      where discord_id = $1
    `;
  
  let values = changedRank
    ? [user.id, points, newRank]
    : [user.id, points];

  const res = await pool.query(query, values);

	if (changedRank) {
		let rankUpdate = {
			oldRank: rank,
			newRank
		}

		//updateRankRole(interaction, user, rankUpdate); 
	}
  updateNicknameWithRank(interaction, user, changedRank ? newRank : rank, points);
}

const reportScore = async (interaction, pool) => {
  try {
    let modalFields = extractModalFields(interaction);
    let reporter;
    let opponent;
    let reporterScore;
    let opponentScore;

    if (interaction.user.id == modalFields.challengerId) {
      reporter = await getUserByDiscordId(interaction, modalFields.challengerId);
      reporterScore = +modalFields['challenger-score'];
      opponent = await getUserByDiscordId(interaction, modalFields.opponentId);
      opponentScore = +modalFields['opponent-score'];
    } else {
      reporter = await getUserByDiscordId(interaction, modalFields.opponentId);
      reporterScore = +modalFields['opponent-score'];
      opponent = await getUserByDiscordId(interaction, modalFields.challengerId);
      opponentScore = +modalFields['challenger-score'];
    }



    const reporterId = reporter.id;
    const opponentId = opponent.id;
    const winnerId = reporterScore > opponentScore ? reporterId : opponentId;
    const canFight = await canPlayersFight(reporter, opponent, pool);
    const isDanisenSessionOpen = await isSessionOpen(pool);
    const isMatchWithinThreshhold = await matchWithinThreshhold(reporter, opponent, pool);

    if (reporterScore + opponentScore > 5 || (reporterScore < 3 && opponentScore < 3)) {
      return {
        matchId: null,
        message: `Invalid game count`
      };
    }

    if (!canFight) {
      return {
        matchId: null,
        message: 'Players ranks are too far apart to play each other'
      };
      
    }

    if (!isDanisenSessionOpen) {
      return {
        matchId: null,
        message: 'Danisen session is not currently open'
      };
    }

    if (isMatchWithinThreshhold) {
	  // &rew 2022-09-24: This probably should check against whether or not it was in the same open sesssion.
      return {
        matchId: null,
        message: 'You have played this player to recently'
      };
    }

    const res = await pool.query(`
    insert into 
      danisen_match(
        player_1_discord_id,
        player_1_score,
        player_2_discord_id,
        player_2_score,
        winner)
    values($1, $2, $3, $4, $5)
    returning id
    `, [reporterId, reporterScore, opponentId, opponentScore, winnerId]);
    
    let matchId = res.rows[0].id;

    return {
      matchId,
      message: 'Match Reported Successfully',
      reporter,
      opponent,
      reporterScore,
      opponentScore
    };
  } catch (err) {
    console.error(err);
    return {
      matchId: null,
      message: 'Failed to report match, reach out to a danisen tech admin'
    };
  }    
}

const verifyMatchScore = async (interaction, pool, matchId) => {
  try {
    const res = await pool.query(`
      update danisen_match set 
        verified = true
      where 
        id = $1
      returning 
        player_1_discord_id,
        player_2_discord_id,
        winner
    `, [matchId]);

    if (res.rows.length == 0) {
      return 'Match Not Found';
    }
    let { player_1_discord_id: reporterId, player_2_discord_id: opponentId, winner: winnerId } = res.rows[0];

    const loserId = winnerId == reporterId ? opponentId : reporterId;

    let winner = await getUserByDiscordId(interaction, winnerId);
    let loser = await getUserByDiscordId(interaction, loserId);
    
    await reportWin(winner, pool, interaction);
    await reportLoss(loser, pool, interaction);
  } catch (error) {
    console.log(error);
    return 'Failed to verify match';
  }
  return 'Match Verified Succsessfully!';
}

const getMatchVerifierId = async (interaction, pool, matchId) => {
  const res = await pool.query(`
    select 
      dm.player_2_discord_id 
    from
      danisen_match dm
    where dm.id = $1
    limit 1
  `, [matchId]);

  if (res.rows.length == 0) {
    return null;
  }
  
  let verifierId = res.rows[0].player_2_discord_id;
  return verifierId;
}

module.exports = {
  isSessionOpen,
  setStatusToMatching,
  setStatusToDormant,
  manualSetRank,
  reportScore,
  canPlayersFight,
  matchWithinThreshhold,
  getMatchVerifierId,
  verifyMatchScore
}
