#!/bin/bash

`aws ecr get-login --region us-east-1` && \
docker build -t gdax-ingestor . && \
docker tag gdax-ingestor:latest 248022314417.dkr.ecr.us-east-1.amazonaws.com/gdax-ingestor:latest && \
docker push 248022314417.dkr.ecr.us-east-1.amazonaws.com/gdax-ingestor:latest

