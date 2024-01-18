# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Modify the file in node_modules
RUN sed -i '86i\    if (!requestOptions.maxContentLength) {\n        requestOptions.maxContentLength = Infinity;\n    }\n\n    if (!requestOptions.maxBodyLength) {\n        requestOptions.maxBodyLength = Infinity;\n    }' node_modules/webdav/dist/node/request.js

# Copy the rest of the application code to the working directory
COPY . .

# Make port 3000 available outside the container
EXPOSE 3000

# Run the application when the container launches
CMD ["node", "server.js"]
