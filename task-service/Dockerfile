FROM node:18
WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./src ./src
EXPOSE 5002
CMD ["npm", "start"]
