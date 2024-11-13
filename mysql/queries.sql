use filmlabs;

##########
# QUERIES
##########

# Select all accounts
select * from account;

# Account Create
insert into account (user_id, username, password) 
values (1, "Monnapse", "password");

# Account Login
select user_id, username, password 
from account 
where username = "Monnapse";

# Username Checker
select user_id from account 
where username = "Monnapse";

# Select film ids
select * from film where tmdb_id = 1;
select * from film ;

# Add film
insert into film values (1, "tv", "test", "2024", 10, "https.com");
insert into film values (2, "movie", "test", "2024", 10, "https.com");
insert into film values (6, "movie", "test", "2024", 10, "https.com");

# Get Favorites
select distinct f.*
from account_favorites af 
join film f on af.tmdb_id = f.tmdb_id 
where af.user_id = 1 
group by f.tmdb_id;

select distinct * from account_favorites af where af.user_id = 1;
select distinct * from account_favorites af where af.user_id = 1 and af.tmdb_id = 1;

# Add Favorite
insert into account_favorites values(1, 1); 
insert into account_favorites values(2, 1); 

# Remove Favorite
delete from account_favorites where tmdb_id = 2 and user_id = 1;

# Add to watch history 
insert into account_watch_history 
(account_history_id, tmdb_id, user_id) 
values (1, 1, 1);

insert into account_watch_history 
(account_history_id, tmdb_id, user_id) 
values (2, 2, 1);

insert into account_watch_history 
(account_history_id, tmdb_id, user_id) 
values (3, 6, 1);

# TV
insert into episode_history 
(account_history_id, episode_number, season_number, progress) 
values (1, 1, 1, "00:00:00");
insert into episode_history 
(account_history_id, episode_number, season_number, progress) 
values (1, 2, 1, "00:00:00");

# MOVIE
insert into movie_history  
(account_history_id, progress) 
values (2, "00:00:00");
insert into movie_history  
(account_history_id, progress) 
values (3, "00:00:00");

# Get Watch History
select f.tmdb_id, 
coalesce(group_concat(tv.progress), group_concat(movie.progress)) as progress, 
coalesce(group_concat(tv.episode_number)) as episode_number,
coalesce(group_concat(tv.season_number)) as season_number
from account_watch_history awh
join film f on awh.tmdb_id = f.tmdb_id
left join episode_history tv on f.media_type = "tv" and awh.account_history_id = tv.account_history_id
left join movie_history movie on f.media_type = "movie" and awh.account_history_id = movie.account_history_id
where awh.user_id = 1
group by f.tmdb_id;

# Get Account Watch History Table
select * from account_watch_history where user_id = 1;
select * from account_watch_history where user_id = 1 and tmdb_id = 94605;

# Get History Movie Table
select * from movie_history where account_history_id = 1;

# Get TV Episode Table
select * from episode_history where account_history_id = 1;

delete from episode_history;