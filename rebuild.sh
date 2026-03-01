# rebuild.sh - taken from https://github.com/mbhs/mbhs

git pull

old_container=$(docker ps -a -q --filter ancestor=mbmt-dev)

old_image=$(docker images -q mbmt-dev)

#docker rm $(docker stop $(docker ps -a -q  --filter ancestor=mbmt-dev))

docker build . -t mbmt-dev --no-cache

docker stop $old_container

docker run --restart unless-stopped -d -p 12891:12891 mbmt-dev

docker rm $old_container

docker rmi $old_image
