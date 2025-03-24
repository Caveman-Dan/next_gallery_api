#!/bin/bash

export NVM_DIR=$HOME/.nvm;
source $NVM_DIR/nvm.sh;

cd /home/dan/node/next_gallery_api

nvm use 18 && npm run start

npm run start

#node --import=tsx next_gallery_api.ts
