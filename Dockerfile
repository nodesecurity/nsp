FROM node:8.6-alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install --global --quiet npm && \
    npm install --quiet

RUN adduser -u 9000 -D app
COPY . ./
RUN chown -R app:app ./

USER app

RUN ./bin/nsp gather

VOLUME /code
WORKDIR /code

CMD ["/usr/src/app/bin/nsp", "check", "--offline", "--advisories", "/usr/src/app/advisories.json", "--warn-only", "--reporter", "codeclimate"]
