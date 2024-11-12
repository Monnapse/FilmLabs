# FilmLabs
 
Local hosted streaming site.

This repository does not store any film files it uses streaming apis to stream movies/tv shows.

You can create accounts to store watch history, you can search for movies, tv shows and anime.

The database uses mysql.

# How to get FilmLabs running

## 1
First Install the files here ____

## 2
## WINDOWS

## LINUX
clone/download the repository `git clone -b film-labs https://github.com/Monnapse/FilmLabs.git` go into directory `cd FilmLabs/` then if you want but not required you can create a virtual environment by `python3 -m venv filmlabs-environment` if you dont have venv package install by doing `apt install python3-venv` activate environemnt `source filmlabs-environment/bin/activate` now install requirements `pip install -r requirements.txt`
now install mysql `sudo apt install mysql-server` no you need to secure mysql by running `sudo mysql_secure_installation` say `y` then password security level do `2` and then all the following questions just say `y` to all of them. now enter mysql `sudo mysql -u root` 
now add your mysql password `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_new_password';` replace `'your_new_password'` with your password now `FLUSH PRIVILEGES;`
now create the database by running `source mysql/forward_engineer.sql`

now create your environment variables by running `sudo nano /etc/environment`
now in that file add:
`FILMLABS_DB="filmlabs"`
`FILMLABS_JWT_KEY="df6^Dju-3Ffsf__d9pFDfSh#7#$)448*#4v$Jf-#HQHjf9hdf-FH(#r#"lrjfx-dSGsDJ4td)"` This variable is your secret key creating your tokens so you can change it to whatever you want but its best to make it long and randomized so no hacker can get it.
`MYSQL_PASSWORD="mysql password"` change mysql passsword with your password you created for your mysql root.
`MYSQL_USER="root"` this is your mysql user that is being logged into just keeep it the same.
`TMDB_API_KEY="your tmdb api key"` put in your tmdb api key here you can get an api key from this [link](https://developer.themoviedb.org/docs/getting-started)

now save by ctrl+o then enter now exit by ctrl+x

now restart `sudo reboot`

once restarted go to your the FilmLabs folder and activate environemnt `source filmlabs-environment/bin/activate` now run your server `python3 main.py` enjoy.

now start the server by running `python3 main.py`

## Update files
if you want to update the files to latest release you do, pull latest changes `git pull origin film-labs`.