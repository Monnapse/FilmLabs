use filmlabs;

##########
# QUERIES
##########

# Select all accounts
select * from account;

# Account Create
insert into account (username, password) values ("Monnapse", "password");

# Account Login
select user_id, username, password from account where username = "Monnapse";

# Username Checker
select user_id from account where username = "Monnapse";

# Delete all accounts
delete from account;