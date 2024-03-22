FROM node:20.11.1

ENV HOME /root
WORKDIR /root

COPY . .

# Download dependancies
RUN npm install
EXPOSE 8080

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD /wait &&  node ./server.js
