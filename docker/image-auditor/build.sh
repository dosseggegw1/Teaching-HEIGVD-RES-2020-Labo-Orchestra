#!/bin/bash

docker build -t res/auditor .
docker run -d res/auditor
