FROM node:7.10-alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN apk --update add curl && \
    npm install && \
    npm run setup-offline

RUN adduser -u 9000 -D app
COPY . ./
RUN chown -R app:app ./

USER app

VOLUME /code
WORKDIR /code

CMD ["/usr/src/app/bin/nsp", "check", "--offline", "--warn-only", "--output", "codeclimate"]
