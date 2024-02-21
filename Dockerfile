FROM node:20.11.1

ENV HOME /root
WORKDIR /root

COPY . .

# Download dependancies
RUN npm install
EXPOSE 8080

CMD node ./server.js