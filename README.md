# FilmLabs
 
This repository does not store any media files it uses streaming apis to stream movies/tv shows.

# Features

* Local hosted streaming site.
* Create/Login accounts.
* Account favoriting for Movies/TV Shows.
* Account Watch history for Movies/TV Shows.
* Account Settings.
* Home page showing popular, trending, new, etc Movies/TV Shows.
* Search for Movies/TV Shows.
* Watch Movies/TV Shows.

# Technical Features
* MYSQL Database.
* Python Flask Server.
* TMDB Api.

# FilmLabs Installation Intructions

## WINDOWS

## LINUX

### Downloading Files
Clone/download the repository by running `git clone -b film-labs https://github.com/Monnapse/FilmLabs.git`.

Now go into directory by running `cd FilmLabs/`.

### Create Virtual Environemnt (Optional)
If you want to use a virtual environment then you want to first run `python3 -m venv filmlabs-environment` 
(if you dont have the venv package install by running `apt install python3-venv`)

Activate the virtual environemnt by running `source filmlabs-environment/bin/activate`.

### Install required packages
Now install required packages by running `pip install -r requirements.txt`.

### Install mysql
Now install the mysql server by running `sudo apt install mysql-server`. Now you need to secure mysql server by 
running `sudo mysql_secure_installation` it will ask some questions, for the first question say `y` 
then password security level question just say `2` for highest security,
and then all the rest of the questions just say `y` to all of them.

### Create mysql password
Now enter mysql by running `sudo mysql -u root` 
add this line and enter a password in `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_new_password';` replace `'your_new_password'` with your password then press enter, once you have done that add this line `FLUSH PRIVILEGES;`

### Create database
Now create the database by adding `source mysql/forward_engineer.sql` to the next line. Exit by entering `exit`.

### Creating environment variables
Now create your environment variables by running `sudo nano /etc/environment`
next in that file add the following on different lines:

1. `FILMLABS_DB="filmlabs"` (this is the name of the database)

2. `FILMLABS_JWT_KEY="df6^Dju-3Ffsf__d9pFDfSh#7#$)448*#4v$Jf-#HQHjf9hdf-FH(#r#"lrjfx-dSGsDJ4td)"` (This variable is your secret key creating your tokens so you can change it to whatever you want but its best to make it long and randomized so no hacker can get it)

3. `MYSQL_PASSWORD="mysql password"` (Change mysql passsword with your password you created for your mysql root)

4. `MYSQL_USER="root"` (This is your mysql user that is being logged into just keep it the same)

5. `TMDB_API_KEY="your tmdb api key"` (Put in your TMDB api key here, you can get an api key from this [link](https://developer.themoviedb.org/docs/getting-started))

Now save the file by doing `ctrl+o` then press `enter` now exit the file by doing `ctrl+x`.

Now restart, so the changes to take effect by running `sudo reboot`.

Once restarted go to your the FilmLabs folder (`cd FilmLabs/`) 
(and if you set up a virtual environment you need to activate it by running  `source filmlabs-environment/bin/activate`) 
now run your server by running `python3 main.py`,  it should print out alot of stuff but what you are looking for is a list of ip adresses like this
```
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:2400  
* Running on http://10.0.0.52:2400
```
`http://127.0.0.1:2400` will only allow access on your local machine. The last one `http://10.0.0.52:2400` allows access to the site on your network.

Now enjoy.

## Update files
if you want to update the files to latest release you do, pull latest changes `git pull origin film-labs`.

# Modifying Home Page Categories
Open `home_page.json`

# Adding/Removing Streaming Apis
Open `services.json`