use filmlabs;

select * from account;

##########
# QUERIES
##########

# Account Creation
insert into account (username, password) values ("Monnapse", "password");

# Username Checker
select user_id from account where username = "Monnapse";

delete from account;