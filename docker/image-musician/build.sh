#!/bin/bash

docker build -t res/musician .
docker run -d res/musician piano
