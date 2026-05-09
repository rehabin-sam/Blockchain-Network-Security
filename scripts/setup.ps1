Write-Host "Starting Full Blockchain App..."

# Start Ganache CLI
##Start-Process powershell -ArgumentList "ganache-cli -p 7545 -d"

Start-Sleep -Seconds 5

# Deploy contracts
npm install
npx truffle compile
npx truffle migrate --reset

# Copy ABI
mkdir client\src\contracts -Force
copy build\contracts\*.json client\src\contracts\

# Start frontend
cd client
npm install
npm start