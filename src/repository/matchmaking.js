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

module.exports = {
  isSessionOpen,
  setStatusToMatching,
  setStatusToDormant
}
