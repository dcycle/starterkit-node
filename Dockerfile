FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD docker-resources /docker-resources

RUN /docker-resources/build-image.sh
RUN npm run build
# CMD [ "node", "app/server.js" ]
CMD [ "forever", "-w", "start", "npm", "--", "run", "start" ]
