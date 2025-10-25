# frontend/Dockerfile
FROM node:18
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app's source code
COPY . .

EXPOSE 3000
CMD ["npm", "start"]