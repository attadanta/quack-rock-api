FROM node:lts-buster-slim
WORKDIR /app
COPY package.json yarn.lock tsconfig.json /app/
RUN yarn --frozen-lockfile
ADD . /app
RUN yarn tsc
VOLUME [ "/data" ]
EXPOSE 3000
CMD [ "yarn", "serve" ]