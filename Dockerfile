FROM ruby:2.7-alpine

RUN apk add --no-cache git build-base pkgconfig imagemagick imagemagick-dev imagemagick-libs

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
