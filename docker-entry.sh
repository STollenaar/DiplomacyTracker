
chgrp -R mysql /var/
chmod -R g+rw /var/

 service mysql start


# ./init-db.sh

node src/server.js
