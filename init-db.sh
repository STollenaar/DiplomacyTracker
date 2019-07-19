USER=diplomacy
USER_PASS=$USER

service mysql start

mysql -u root --password="$USER_PASS" -h localhost <<-EOSQL
 CREATE DATABASE IF NOT EXISTS DIPLOMACY_DB;
 GRANT ALL ON DIPLOMACY_DB.* TO '$USER' IDENTIFIED BY '$USER_PASS';
EOSQL


#cat ./DIPLOMACY_DB.sql | mysql -u "$USER" --password="$USER_PASS" COPY_DB

