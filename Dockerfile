FROM node:17-alpine
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev"]