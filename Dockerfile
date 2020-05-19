FROM node:12 as builder
ARG adapter
WORKDIR /home/node/app

COPY package.json yarn.lock Makefile ./
COPY bootstrap/package.json bootstrap/package.json
COPY $adapter/package.json $adapter/package.json
RUN make deps

COPY bootstrap bootstrap
COPY $adapter $adapter

EXPOSE 8080

WORKDIR /home/node/app/$adapter
CMD ["yarn", "server"]