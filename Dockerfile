FROM node:20.11.1

ENV HOME /root
WORKDIR /root

COPY . .

EXPOSE 8080

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD /wait && echo "\n\n\tStarting web server step 1/2 (installing packages)...\n\n" && npm install && echo "\n\n\tStarting web server step 2/2 (running server.js)...\n\n" && npx nodemon -L server.js
