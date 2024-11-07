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
  PRIMARY KEY (`tmdb_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `filmlabs`.`account_watch_history`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `filmlabs`.`account_watch_history` ;

CREATE TABLE IF NOT EXISTS `filmlabs`.`account_watch_history` (
  `history_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  INDEX `fk_watch_history_account1_idx` (`user_id` ASC) VISIBLE,
  PRIMARY KEY (`history_id`),
  CONSTRAINT `fk_watch_history_account1`
    FOREIGN KEY (`user_id`)
    REFERENCES `filmlabs`.`account` (`user_id`)
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
-- Table `filmlabs`.`account_history_film`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `filmlabs`.`account_history_film` ;

CREATE TABLE IF NOT EXISTS `filmlabs`.`account_history_film` (
  `history_id` INT NOT NULL AUTO_INCREMENT,
  `tmdb_id` INT NOT NULL,
  `progress` VARCHAR(45) NULL,
  `season` INT NULL,
  `episode` INT NULL,
  PRIMARY KEY (`history_id`),
  INDEX `fk_history_tv_watch_history1_idx` (`history_id` ASC) VISIBLE,
  CONSTRAINT `fk_history_movie_film10`
    FOREIGN KEY (`tmdb_id`)
    REFERENCES `filmlabs`.`film` (`tmdb_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_history_tv_watch_history1`
    FOREIGN KEY (`history_id`)
    REFERENCES `filmlabs`.`account_watch_history` (`history_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
