const { CharacterCodes, getEmoji } = require('@utility/characterCodes');

const registerUser = async (interaction, pool) => {
  const res = await pool.query(`
    insert into danisen_user(discord_id, username)
    values($1, $2);
  `,[interaction.user.id,interaction.user.tag]);
}

const doesUserExist = async (interaction, pool) => {
  const res = await pool.query(`
    select count(*) from danisen_user where discord_id = $1;
  `, [interaction.user.id]);
  return res.rows[0].count > 0;
}

const userHasFreeTeamSlot = async (interaction, pool) => {
  const res = await pool.query(`
    select team1, team2, team3 from danisen_user where discord_id = $1 limit 1;
  `,
    [interaction.user.id]);
  
  let row = res.rows[0];
  if (row.team_1 == null || row.team_2 == null || row.team_3 == null) {
    return true;
  } else {
    return false;
  }
}

const getUserProfile = async (interaction, pool) => {
  let res = await pool.query(`
    select 
   	  du.username,
   	  du.rank,
   	  du.points,
   	  (select row_to_json(t1) from (select st.character_1, st.character_2, st.character_3 from sg_team st where id = du.team1) as t1) team1,
   	  (select row_to_json(t2) from (select st.character_1, st.character_2, st.character_3 from sg_team st where id = du.team2) as t2) team2,
   	  (select row_to_json(t3) from (select st.character_1, st.character_2, st.character_3 from sg_team st where id = du.team3) as t3) team3
   	  from danisen_user du
   	  where discord_id = $1
   	  limit 1
  `, [interaction.user.id]);

  let profile = res.rows[0];

  let teams = [];

  if (profile.team1 != null) {
    let rawTeamObj = profile.team1;
    let rawTeam = [];
    if (rawTeamObj.character_1 != null) rawTeam.push(rawTeamObj.character_1);
    if (rawTeamObj.character_2 != null) rawTeam.push(rawTeamObj.character_2);
    if (rawTeamObj.character_3 != null) rawTeam.push(rawTeamObj.character_3);
    let team = rawTeam.map(rt => {
      return getEmoji(rt);
    });
    let formattedTeam = team.join(' | ');
    teams.push(formattedTeam);
  }

  if (profile.team2 != null) {
    let rawTeamObj = profile.team2;
    let rawTeam = [];
    if (rawTeamObj.character_1 != null) rawTeam.push(rawTeamObj.character_1);
    if (rawTeamObj.character_2 != null) rawTeam.push(rawTeamObj.character_2);
    if (rawTeamObj.character_3 != null) rawTeam.push(rawTeamObj.character_3);
    let team = rawTeam.map(rt => {
      return getEmoji(rt);
    });
    let formattedTeam = team.join(' | ');
    teams.push(formattedTeam);
  }

  if (profile.team3 != null) {
    let rawTeamObj = profile.team3;
    let rawTeam = [];
    if (rawTeamObj.character_1 != null) rawTeam.push(rawTeamObj.character_1);
    if (rawTeamObj.character_2 != null) rawTeam.push(rawTeamObj.character_2);
    if (rawTeamObj.character_3 != null) rawTeam.push(rawTeamObj.character_3);
    let team = rawTeam.map(rt => {
      return getEmoji(rt);
    });
    let formattedTeam = team.join(' | ');
    teams.push(formattedTeam);
  }

  return {
    username: profile.username.split('#')[0],
    rank: profile.rank,
    points: profile.points,
    teams
  }
}

const nextOpenTeamSlot = async (interaction, pool) => {
  let res = await pool.query(`
    select
      case 
	      when team1 is null and team2 is null and team3 is null then 'team1'
	      when team1 is not null and team2 is null and team3 is null then 'team2'
	      when team1 is not null and team2 is not null and team3 is null then 'team3'
	      else 'none'
      end as value
    from danisen_user du
    where discord_id = $1
    limit 1
  `, [interaction.user.id]);

  return res.rows[0].value;
}

const registerNewTeam = async (interaction, pool) => {
  let openSlot = await nextOpenTeamSlot(interaction, pool);
  if (openSlot == 'none') {
    return '';
  }
  let rawCharacters = interaction.options['_hoistedOptions'].map(ho => ho.value);
  const dedupedCharacterSet = new Set(rawCharacters);
  const characters = Array.from(dedupedCharacterSet);

  if (characters.length == 0) {
    return '';
  }

  let query = '';
  switch (characters.length) {
    case 1:
      query = `
        insert into sg_team(owner_id, character_1)
        select
          id,
          $2
        from danisen_user
        where discord_id = $1
        returning id`;
      break;
    case 2:
      query = `
        insert into sg_team(owner_id, character_1, character_2)
        select
          id,
          $2,
          $3
        from danisen_user
        where discord_id = $1
        returning id`;
      break;
    case 3:
      query = `
        insert into sg_team(owner_id, character_1, character_2, character_3)
        select
          id,
          $2,
          $3,
          $4
        from danisen_user
        where discord_id = $1\
        returning id`;
      break;
  }
  
  let teamCreateResult = await pool.query(query, [interaction.user.id, ...characters]);
  let teamId = teamCreateResult.rows[0].id;

  let teamRegQuery = `update danisen_user set ${openSlot} = $2 where discord_id = $1`;
  await pool.query(teamRegQuery, [interaction.user.id, teamId]);
  let emojiArray = characters.map(c => getEmoji(c));
  return emojiArray.join(' | ');
}

module.exports = {
  registerUser,
  doesUserExist,
  userHasFreeTeamSlot,
  getUserProfile,
  registerNewTeam
}
