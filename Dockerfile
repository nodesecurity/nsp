FROM node:7.10-alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN apk --update add curl && \
    npm install -g npm && \
    npm install && \
    /usr/src/app/bin/nsp gather

RUN adduser -u 9000 -D app
COPY . ./
RUN chown -R app:app ./

USER app

VOLUME /code
WORKDIR /code

CMD ["/usr/src/app/bin/nsp", "check", "--offline", "--advisories", "/usr/src/app/advisories.json", "--warn-only", "--reporter", "codeclimate"]
