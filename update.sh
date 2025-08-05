#!/bin/sh
set -e

docker-compose exec nginx nginx -s reload
