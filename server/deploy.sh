#!/bin/sh
docker build -t thetkpark/stock-server .
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push thetkpark/stock-server
