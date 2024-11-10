-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema filmlabs
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `filmlabs` ;

-- -----------------------------------------------------
-- Schema filmlabs
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `filmlabs` DEFAULT CHARACTER SET utf8 ;
USE `filmlabs` ;

-- -----------------------------------------------------
-- Table `filmlabs`.`account`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `filmlabs`.`account` ;

CREATE TABLE IF NOT EXISTS `filmlabs`.`account` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(80) NOT NULL,
  PRIMARY KEY (`user_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `filmlabs`.`film`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `filmlabs`.`film` ;

CREATE TABLE IF NOT EXISTS `filmlabs`.`film` (
  `tmdb_id` INT NOT NULL,
  `media_type` VARCHAR(20) NOT NULL,
  `name` VARCHAR(85) NOT NULL,
  `year` VARCHAR(8) NOT NULL,
  `rating` FLOAT NOT NULL,
  `poster` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`tmdb_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `filmlabs`.`account_watch_history`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `filmlabs`.`account_watch_history` ;

CREATE TABLE IF NOT EXISTS `filmlabs`.`account_watch_history` (
  `account_history_id` INT NOT NULL AUTO_INCREMENT,
  `tmdb_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  INDEX `fk_account_watch_history_account1_idx` (`user_id` ASC) VISIBLE,
  PRIMARY KEY (`account_history_id`),
  INDEX `fk_account_watch_history_film1_idx` (`tmdb_id` ASC) VISIBLE,
  CONSTRAINT `fk_account_watch_history_account1`
    FOREIGN KEY (`user_id`)
    REFERENCES `filmlabs`.`account` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_account_watch_history_film1`
    FOREIGN KEY (`tmdb_id`)
    REFERENCES `filmlabs`.`film` (`tmdb_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `filmlabs`.`account_favorites`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `filmlabs`.`account_favorites` ;

CREATE TABLE IF NOT EXISTS `filmlabs`.`account_favorites` (
  `tmdb_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  INDEX `fk_account_favorites_account_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_account_favorites_account`
    FOREIGN KEY (`user_id`)
    REFERENCES `filmlabs`.`account` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_account_favorites_film1`
    FOREIGN KEY (`tmdb_id`)
    REFERENCES `filmlabs`.`film` (`tmdb_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `filmlabs`.`movie_history`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `filmlabs`.`movie_history` ;

CREATE TABLE IF NOT EXISTS `filmlabs`.`movie_history` (
  `account_history_id` INT NOT NULL,
  `progress` VARCHAR(10) NULL,
  INDEX `fk_movie_history_account_watch_history1_idx` (`account_history_id` ASC) VISIBLE,
  CONSTRAINT `fk_movie_history_account_watch_history1`
    FOREIGN KEY (`account_history_id`)
    REFERENCES `filmlabs`.`account_watch_history` (`account_history_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `filmlabs`.`episode_history`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `filmlabs`.`episode_history` ;

CREATE TABLE IF NOT EXISTS `filmlabs`.`episode_history` (
  `account_history_id` INT NOT NULL,
  `episode_id` INT NOT NULL,
  `progress` VARCHAR(10) NULL,
  CONSTRAINT `fk_episode_history_account_watch_history1`
    FOREIGN KEY (`account_history_id`)
    REFERENCES `filmlabs`.`account_watch_history` (`account_history_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
