#!/bin/bash

`aws ecr get-login --region us-east-1` && \
docker build -t btcc-ingestor . && \
docker tag btcc-ingestor:latest 248022314417.dkr.ecr.us-east-1.amazonaws.com/btcc-ingestor:latest && \
docker push 248022314417.dkr.ecr.us-east-1.amazonaws.com/btcc-ingestor:latest
