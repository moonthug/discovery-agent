FROM node:8.9.4

WORKDIR /modules/discovery-agent

COPY package*.json ./

RUN npm install

COPY . .
