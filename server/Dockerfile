FROM node:alpine as builder
WORKDIR /app
COPY ./package.json ./
RUN yarn
COPY ./ ./
RUN yarn build

# FROM node:alpine 
# WORKDIR /app
# COPY ./package.json ./
# RUN yarn
# COPY --from=builder /app/build ./
EXPOSE 3050
CMD [ "node", "./build/main.js" ]
# CMD [ "node", "main.js" ]