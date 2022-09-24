create table if not exists danisen_user(
  id bigserial not null,
  discord_id bigint not null,
  username varchar(100) not null,
  rank varchar(20) null default '1st Dan',
  points smallint null default 0,
  team1 bigint null,
  team2 bigint null,
  team3 bigint null,
  current_status varchar(20) null default 'dormant',
  created_on timestamptz null default now(),
  primary key(id)
);

create table if not exists sg_team(
  id bigserial not null,
  owner_id bigint not null,
  date_registered timestamptz null default now(),
  character_1 varchar(4) not null,
  character_2 varchar(4) null,
  character_3 varchar(4) null,
  active boolean null default true,
  primary key(id),
  constraint fk_team_owner
    foreign key(owner_id)
      references danisen_user(id)
);


create table if not exists danisen_match(
  id bigserial not null,
  player_1_discord_id bigint not null,
  player_1_score int4 not null,
  player_2_discord_id bigint not null,
  player_2_score int4 not null,
  winner bigint not null,
  match_date timestamptz null default now(),
  primary key(id)
);

