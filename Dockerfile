FROM oven/bun:1.0.1
WORKDIR /app
COPY package.json yarn.lock tsconfig.json /app/
RUN bun i --frozen-lockfile
ADD . /app
VOLUME [ "/data", "/logs" ]
EXPOSE 3000
CMD [ "bun", "serve" ]
