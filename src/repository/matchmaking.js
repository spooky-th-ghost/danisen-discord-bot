const moment = require('moment');

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
    case 'Lord':
      return (rank2 == '1st Dan');
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

  //return hourDiff > process.env
  return  false;
}

const reportWin = async (user, pool) => {

}

const reporLoss = async (user, pool) => {

}

const reportScore = async (interaction, pool) => {
  try {
    const reporter = interaction.user;
    const opponent = interaction.options.getUser('opponent');

    const canFight = await canPlayersFight(reporter, opponent, pool);
    const isDanisenSessionOpen = await isSessionOpen(pool);
    const isMatchWithinThreshhold = await matchWithinThreshhold(reporter, opponent, pool);

    if (!canFight) {
      return 'Players ranks are too far apart to play each other';
    }

    if (!isDanisenSessionOpen) {
      return 'Danisen session is not currently open';
    }

    if (isMatchWithinThreshhold) {
      return 'You have played this player to recently';
    }

    const reporterId = reporter.id;
    const opponentId = opponent.id;
    const reporterScore = interaction.options.getInteger('your-win-count');
    const opponentScore = interaction.options.getInteger('opponent-win-count');
    const winnerId = reporterScore > opponentScore ? reporterId : opponentId;

    const res = await pool.query(`
    insert into 
      danisen_match(
        player_1_discord_id,
        player_1_score,
        player_2_discord_id,
        player_2_score,
        winner)
    values($1, $2, $3, $4, $5)
  `, [reporterId, reporterScore, opponentId, opponentScore, winnerId]);

    // TODO: Adjust user scores, for simplicities sake i will write a stored function in the DB for this

    return 'Match Reported Successfully'
  } catch (err) {
    console.error(err);
    return 'Failed to report match'
  }    

}
module.exports = {
  isSessionOpen,
  setStatusToMatching,
  setStatusToDormant,
  reportScore
}
