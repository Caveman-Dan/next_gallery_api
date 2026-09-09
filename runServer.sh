#!/bin/bash

export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
source "$NVM_DIR/nvm.sh"

cd /home/dan/node/next_gallery_api || exit 1

nvm use 22 && npm start

#node --import=tsx next_gallery_api.ts
