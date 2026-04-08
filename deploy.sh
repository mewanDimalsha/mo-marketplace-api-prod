#!/bin/bash

# Build the application
npm run build

# Install production dependencies only
npm ci --only=production

# Start the server
npm run start:prod