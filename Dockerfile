FROM node:12-alpine as builder

RUN apk --no-cache add --virtual builds-deps build-base python git

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY . /home/node

RUN npm ci \
    && npm run build

# ---

FROM node:12-alpine

RUN apk --no-cache add --virtual builds-deps build-base python git

ENV NODE_ENV development

USER node
WORKDIR /home/node

#EXPOSE 4443

COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/dist/ /home/node/dist/
# COPY --from=builder /home/node/order.ejs /home/node/order.ejs
COPY --from=builder /home/node/key.p8 /home/node/key.p8
# COPY --from=builder /home/node/uploads/ /home/node/uploads/
# COPY --from=builder /home/node/.env.example /home/node/.env
# RUN mkdir /home/node/uploads
# RUN mkdir /home/node/uploads/categories
# RUN mkdir /home/node/uploads/brands
# RUN mkdir /home/node/uploads/products

RUN npm ci

CMD ["node", "dist/main.js"]
