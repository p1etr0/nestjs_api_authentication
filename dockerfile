FROM node:16-alpine3.16

WORKDIR /app

# Copy prisma directory
COPY prisma ./prisma/

COPY package*.json ./


RUN apk add --update python3 make g++\
   && rm -rf /var/cache/apk/*
RUN npm install
RUN npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 3000

RUN npm run build

CMD ["npm", "run", "deploy"]
