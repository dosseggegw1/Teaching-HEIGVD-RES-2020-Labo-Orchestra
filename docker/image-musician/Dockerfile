FROM node:16

COPY src/ /opt/app
WORKDIR /opt/app

RUN npm install

ENTRYPOINT ["node", "musician.js"]
