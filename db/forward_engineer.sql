-- Schema filmlabs
CREATE SCHEMA IF NOT EXISTS filmlabs;
SET search_path TO filmlabs;

-- 1. Account Table
CREATE TABLE account (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(45) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 2. Film Table
CREATE TABLE film (
    tmdb_id INT PRIMARY KEY,
    media_type VARCHAR(8) NOT NULL,
    name VARCHAR(100) NOT NULL,
    release_date VARCHAR(15) NOT NULL,
    rating REAL NOT NULL,
    poster VARCHAR(120) NOT NULL
);

-- 3. Account Watch History
CREATE TABLE account_watch_history (
    account_history_id SERIAL PRIMARY KEY,
    tmdb_id INT NOT NULL REFERENCES film(tmdb_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES account(user_id) ON DELETE CASCADE
);

-- 4. Account Favorites
CREATE TABLE account_favorites (
    tmdb_id INT NOT NULL REFERENCES film(tmdb_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES account(user_id) ON DELETE CASCADE,
    PRIMARY KEY (tmdb_id, user_id)
);

-- 5. Movie History
CREATE TABLE movie_history (
    account_history_id INT PRIMARY KEY REFERENCES account_watch_history(account_history_id) ON DELETE CASCADE,
    progress VARCHAR(10)
);

-- 6. Episode History
CREATE TABLE episode_history (
    account_history_id INT REFERENCES account_watch_history(account_history_id) ON DELETE CASCADE,
    episode_number INT NOT NULL,
    season_number INT NOT NULL,
    progress VARCHAR(10),
    PRIMARY KEY (account_history_id, season_number, episode_number)
);