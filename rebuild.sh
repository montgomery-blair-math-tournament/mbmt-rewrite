# rebuild.sh - taken from https://github.com/mbhs/mbhs

git pull

old_container=$(docker ps -a -q --filter ambmts)

old_image=$(docker images -q mbmt)

#docker rm $(docker stop $(docker ps -a -q  --filter ancestor=mbmt))

docker build . -t mmbmtbhs --no-cache

docker stop $old_container

docker run --restart unless-stopped -d -p 12890:12890 mbmt

docker rm $old_container

docker rmi $old_image
