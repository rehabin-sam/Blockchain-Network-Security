#!/bin/bash

echo "Starting Blockchain Project Setup..."

# Step 1: Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Step 2: Compile contracts
echo "Compiling smart contracts..."
npx truffle compile

# Step 3: Deploy contracts (reset every time)
echo "Deploying contracts to local blockchain..."
npx truffle migrate --reset

# Step 4: Copy contract artifacts to frontend
echo "Copying contract artifacts to frontend..."

mkdir -p client/src/contracts
cp -r build/contracts/*.json client/src/contracts/

# Step 5: Install frontend dependencies
echo "Installing frontend dependencies..."
cd client
npm install

echo "Setup Complete!"
echo "Now run: cd client && npm start"