FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p db  logs
RUN chown -R node db logs

EXPOSE 2606
CMD [ "npm", "run", "start" ]
