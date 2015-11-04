FROM alpine:edge

WORKDIR /code
ADD . /app

RUN apk --update add nodejs curl && \
    npm install -g npm && \
    cd /app && \
    npm install && \
    npm run setup-offline

CMD ["/app/bin/nsp", "check", "--offline", "--warn-only", "-o", "codeclimate"]
