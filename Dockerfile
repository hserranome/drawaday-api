# Base image
FROM node:20

# Create app directory
WORKDIR /api

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json ./
COPY yarn.lock ./

# Install app dependencies
RUN yarn

# Bundle app source
COPY . .

# Expose the port on which the app will run
EXPOSE 3000

# Start the server using the production build
CMD ["yarn", "dev"]