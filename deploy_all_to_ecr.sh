#!/bin/bash

for dir in $( ls -d -- */ ); do
  (cd $dir && ./deploy_to_ecr.sh) &
done
