#!/usr/bin/env bash
sudo docker run -p 80:8000 --env redis_host=10.1.0.4 --env redis_port=6379 -d mleontieff/cloud_computing_two:latest
