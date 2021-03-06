FROM node:8-slim

EXPOSE 8000

WORKDIR /usr/src/app

COPY ./twitter-follow/ .

WORKDIR /usr/src/app/client

# Client
RUN npm install

RUN npm run build

WORKDIR /usr/src/app

RUN rm -rf client/

# Server
RUN npm install

RUN npm run build

RUN rm -rf src/

RUN chmod +x ./start-server.sh

CMD [ "bash", "./start-server.sh" ]