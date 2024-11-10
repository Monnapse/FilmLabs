use filmlabs;

##########
# QUERIES
##########

# Select all accounts
select * from account;

# Account Create
insert into account (user_id, username, password) 
values (2, "Monnapse", "password");

# Account Login
select user_id, username, password 
from account 
where username = "Monnapse";

# Username Checker
select user_id from account 
where username = "Monnapse";

# Select film ids
select * from film where tmdb_id = 1;

# Add film
insert into film values (1, "tv", "test", "2024", 10);
insert into film values (2, "movie", "test", "2024", 10);

# Get Favorites
select distinct f.tmdb_id, f.media_type, f.name, f.year, f.rating 
from account_favorites af 
join film f on af.tmdb_id = f.tmdb_id 
where af.user_id = 1 
group by f.tmdb_id;

select distinct * from account_favorites af where af.user_id = 1;

# Favorite
insert into account_favorites values(1, 1); 
insert into account_favorites values(2, 1); 

# Add to watch history 
insert into account_watch_history 
(account_history_id, tmdb_id, user_id) 
values (1, 1, 1);

insert into account_watch_history 
(account_history_id, tmdb_id, user_id) 
values (2, 2, 1);

# TV
insert into episode_history 
(account_history_id, episode_id, progress) 
values (1, 1, "00:00:00");

# MOVIE
insert into movie_history  
(account_history_id, progress) 
values (2, "00:00:00");

# Get Watch History
select f.tmdb_id, 
coalesce(group_concat(tv.progress), group_concat(movie.progress)) as progress, 
coalesce(group_concat(tv.episode_id)) as episode_id
from account_watch_history awh
join film f on awh.tmdb_id = f.tmdb_id
left join episode_history tv on f.media_type = "tv" and awh.account_history_id = tv.account_history_id
left join movie_history movie on f.media_type = "movie" and awh.account_history_id = movie.account_history_id
where awh.user_id = 1
group by f.tmdb_id;