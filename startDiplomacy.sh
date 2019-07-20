    
#git pull

SCRIPT_DIR=$(cd $(dirname "$0"); pwd)

docker build --rm -t diplomacybot . 

docker run -d --name diplomacybot --rm -t -i --log-driver=journald -v diplomacyBot:/var/ diplomacybot

