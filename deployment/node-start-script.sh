#!/usr/bin/env bash

# link systemd dns config to resolv.conf
sudo ln -s /run/systemd/resolve/resolv.conf /etc/resolv.conf

# Fetch a particular docker image and run with config
# run as daemon to prevent cloud init exec timeout
sudo docker run -p 80:8000 \
    --env redis_host=10.1.0.9 \
    --env redis_port=6379 \
    -d mleontieff/cloud_computing_two:2.1


