# Project Title

**This is project web implement thirdparty yahoo-finance which query price crypto and use levelDB for local cache and improve response time**

## Cache
 - LevelDB

## Enviroment
 - Node version 20.17.0
 - npm version 10.8.2

## Suggestion
 - You can check version library and script run in package.json file.
 - You can import the postman collection for test API.

### Run install dependencies
 ```
 npm i, npm install
 ```
 
### Run app
 ```
 npm run start
 ```

### Script test
 ```
 curl "http://localhost:3000/price?symbol=AAPL"
 ```