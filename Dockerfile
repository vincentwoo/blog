FROM ruby:2.7-alpine

RUN apk add --no-cache git build-base imagemagick

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
