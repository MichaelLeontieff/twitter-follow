FROM node:8-slim

EXPOSE 8000

WORKDIR /usr/src/app

COPY ./twitter-follow/ .

# Server-side
RUN npm install

WORKDIR /usr/src/app/client

# Client
RUN npm install

RUN npm run build

WORKDIR /usr/src/app

RUN rm -rf client/

RUN chmod +x ./start-server.sh

CMD [ "bash", "./start-server.sh" ]