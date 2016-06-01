#!/bin/bash

`aws ecr get-login --region us-east-1` && \
docker build -t poloniex-ingestor . && \
docker tag poloniex-ingestor:latest 248022314417.dkr.ecr.us-east-1.amazonaws.com/poloniex-ingestor:latest && \
docker push 248022314417.dkr.ecr.us-east-1.amazonaws.com/poloniex-ingestor:latest
