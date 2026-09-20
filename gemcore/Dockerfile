FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
ENV GEMCORE_PORT=4300
EXPOSE 4300
CMD ["npm","start"]
