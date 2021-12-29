# SecretSwap App

Website hosted at https://app.secretswap.io

Official repository at https://github.com/SecretFinance/SecretSwap

## Instructions

### Migrate from previous installation

A one time clean up is required if migrating from another repo source. The npm module `Husky` was removed from this repo
and files are left behind that produce unwanted side effects with `git`.

Therefore, delete all files in the existing `SecretSwapApp/.git` folder that contain text "`Hook created by Husky`".

### Installation

1. Install Git [Getting started](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
2. Install Node.js [tested with 16.xx.x LTS](https://nodejs.org/en/)
3. Install Yarn `npm install --global yarn`
4. Install app `git clone https://github.com/SecretFinance/SecretSwap.git ./SecretSwapApp`
5. Change to folder `SecretSwapApp`, and run `yarn` to install node_modules
6. Under Windows, run `npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"` (your git path may differ)

### Running

Run for Mainnet
```
yarn host
```

Run for Testnet
```
yarn host:testnet
```

After using any host command, visit the ui at `http://localhost:3000`

Build a production site
```
yarn make
```

Config files for different networks are at `src/config/`

To host this repo on render.com, follow this [guide](https://render.com/docs/deploy-create-react-app#using-client-side-routing) to add a Rewrite Rule
