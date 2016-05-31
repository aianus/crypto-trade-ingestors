#!/bin/bash

`aws ecr get-login --region us-east-1` && \
docker build -t bitfinex-ingestor . && \
docker tag bitfinex-ingestor:latest 248022314417.dkr.ecr.us-east-1.amazonaws.com/bitfinex-ingestor:latest && \
docker push 248022314417.dkr.ecr.us-east-1.amazonaws.com/bitfinex-ingestor:latest
