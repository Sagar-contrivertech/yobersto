FROM node:latest

WORKDIR /index

COPY package.json .

RUN npm install 

COPY . .

EXPOSE 8081

CMD [ "node", "index.js", "npm", "start" ]