#!/bin/bash

cd "$(dirname "$0")"

export PATH="$PATH:/Users/jdelman/.nvm/versions/node/v22.16.0/bin"

GOOGLE_APPLICATION_CREDENTIALS=google-service-account-credentials.json node test-puppet.js
