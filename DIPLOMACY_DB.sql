SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `game` (
  `gameid` int(11) NOT NULL,
  `startyear` int(11) NOT NULL,
  `startseason` varchar(45) NOT NULL,
  `date` varchar(45) NOT NULL,
  `phase` longtext NOT NULL,
  `type` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `gamedata` (
  `game_gameid` int(11) NOT NULL ,
  `player_playername` varchar(45) NOT NULL ,
  `supply_centers` int(11) NOT NULL ,
  `units` int(11) NOT NULL ,
  `country` varchar(45) NOT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ;

CREATE TABLE `player` (
  `playername` varchar(45) NOT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ;

CREATE TABLE `subscription` (
  `game_gameid` int(11) NOT NULL ,
  `player_playername` varchar(45) NOT NULL ,
  `userid` longtext NOT NULL ,
  `guildid` longtext NOT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ;


ALTER TABLE `game`
  ADD PRIMARY KEY (`gameid`);

ALTER TABLE `gamedata`
  ADD KEY `fk_gamedata_player1_idx` (`player_playername`),
  ADD KEY `fk_gamedata_game_idx` (`game_gameid`);

ALTER TABLE `player`
  ADD PRIMARY KEY (`playername`);

ALTER TABLE `subscription`
  ADD KEY `fk_subscription_player1_idx` (`player_playername`),
  ADD KEY `fk_player_game_1` (`game_gameid`);


ALTER TABLE `game`
  MODIFY `gameid` int(11) NOT NULL AUTO_INCREMENT , AUTO_INCREMENT=238733;

ALTER TABLE `gamedata`
  ADD CONSTRAINT `fk_game_game_0` FOREIGN KEY (`game_gameid`) REFERENCES `game` (`gameid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `subscription`
  ADD CONSTRAINT `fk_player_game_1` FOREIGN KEY (`game_gameid`) REFERENCES `game` (`gameid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_player_player_0` FOREIGN KEY (`player_playername`) REFERENCES `player` (`playername`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
