FROM node

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD docker-resources /docker-resources

RUN /docker-resources/build-image.sh

CMD [ "node", "app/server.js" ]
