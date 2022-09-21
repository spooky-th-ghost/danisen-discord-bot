# Danisen Bot
A Discord bot, written in Node.Js, made to track data for the Skullgirls Danisen Community Rankings

## Running the Bot

1. Make sure you have a `.env` file in your root that matches the keys/values in `.env.example`

2. Make sure you have [node.js](https://nodejs.org/en/) installed

3. Make sure you have [yarn](https://yarnpkg.com) installed

4. Run the following commands in the root directory:
```
$ yarn install

$ yarn start
```


## Commands
To add/edit commands, update the commands entry in `deploy-commands.js` and then run the following
```
$ yarn install

$ node deploy-commands.js
``` 
