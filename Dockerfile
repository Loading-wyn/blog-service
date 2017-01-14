FROM risingstack/alpine:3.4-v7.0.0-4.1.0
# FROM node:6.7.0

RUN apk update && apk add ca-certificates && \
    apk add tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone
# for unbuntu
# RUN echo "Asia/Shanghai" > /etc/timezone
# RUN dpkg-reconfigure -f noninteractive tzdata








RUN mkdir -p /ebsa/service \
  && mkdir -p /tmp/service \
  && mkdir -p /int/www \
  && touch /int/www/stats.html

ADD package.json /tmp/service/
RUN cd /tmp/service && NODE_ENV=development npm install
WORKDIR /ebsa/service
RUN ln -s /tmp/service/node_modules

COPY . /ebsa/service

EXPOSE 80
CMD ["npm", "run", "start"]
