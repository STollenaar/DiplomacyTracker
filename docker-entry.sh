
chgrp -R mysql /var/
chmod -R g+rw /var/

 service mysql start


# ./init-db.sh

 sqlite3 src/COPY_DB.db < COPY_DB.db.sql

node src/server.js
