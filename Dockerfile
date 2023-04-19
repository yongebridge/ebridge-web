FROM node:16.16.0

ARG web=/opt/workspace/aelf-bridge-frontend

WORKDIR ${web}

COPY . ${web}

RUN yarn \
    && yarn build:mainnet

ENTRYPOINT yarn start:mainnet

EXPOSE 3000
