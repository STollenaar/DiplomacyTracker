SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `game` (
  `GameID` int(11) NOT NULL,
  `startYear` int(11) NOT NULL,
  `startSeason` varchar(45) NOT NULL,
  `date` varchar(45) NOT NULL,
  `phase` longtext NOT NULL,
  `type` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `gamedata` (
  `Game_GameID` int(11) NOT NULL ,
  `Player_PlayerName` varchar(45) NOT NULL ,
  `supply_centers` int(11) NOT NULL ,
  `units` int(11) NOT NULL ,
  `country` varchar(45) NOT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ;

CREATE TABLE `player` (
  `PlayerName` varchar(45) NOT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ;

CREATE TABLE `subscription` (
  `Game_GameID` int(11) NOT NULL ,
  `Player_PlayerName` varchar(45) NOT NULL ,
  `userId` longtext NOT NULL ,
  `guildId` longtext NOT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ;


ALTER TABLE `game`
  ADD PRIMARY KEY (`GameID`);

ALTER TABLE `gamedata`
  ADD KEY `fk_gamedata_player1_idx` (`Player_PlayerName`),
  ADD KEY `fk_gamedata_game_idx` (`Game_GameID`);

ALTER TABLE `player`
  ADD PRIMARY KEY (`PlayerName`);

ALTER TABLE `subscription`
  ADD KEY `fk_subscription_player1_idx` (`Player_PlayerName`),
  ADD KEY `fk_player_game_1` (`Game_GameID`);


ALTER TABLE `game`
  MODIFY `GameID` int(11) NOT NULL AUTO_INCREMENT , AUTO_INCREMENT=238733;

ALTER TABLE `gamedata`
  ADD CONSTRAINT `fk_game_game_0` FOREIGN KEY (`Game_GameID`) REFERENCES `game` (`GameID`) ON DELETE CASCADE;

ALTER TABLE `subscription`
  ADD CONSTRAINT `fk_player_game_1` FOREIGN KEY (`Game_GameID`) REFERENCES `game` (`GameID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_player_player_0` FOREIGN KEY (`Player_PlayerName`) REFERENCES `player` (`PlayerName`) ON DELETE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
