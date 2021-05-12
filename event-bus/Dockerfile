# Specify Base Image
FROM node:alpine
# Working directory
WORKDIR /app

# INSTALL SOME DEPENDENCIES
# Copy everything from current working directory of project
# to current working directory inside container
COPY ./package.json ./
RUN npm install
COPY ./ ./

# Default command
CMD ["npm", "start"]