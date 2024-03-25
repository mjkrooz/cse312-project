FROM node:20.11.1 as base

ENV HOME /root
WORKDIR /root

COPY . .

EXPOSE 8080

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

# Separate container builds depending on target. Dev uses nodemon and shared folder for ease of development.
# Build dev with: docker compose -f docker-compose.dev.yml up --build --force-recreate
# Build prod with: docker compose up --build --force-recreate
# Source: https://stackoverflow.com/a/76145132

FROM base as prod

RUN npm install
CMD node server.js

FROM base as dev

CMD /wait && echo "\n\n\tStarting web server step 1/2 (installing packages)...\n\n" && npm install && echo "\n\n\tStarting web server step 2/2 (running server.js)...\n\n" && npx nodemon -L server.js
