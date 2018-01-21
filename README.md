Install client and server dependencies
  - npm install

Build web client (puts static client app in ./server/public/app)
  - npm run build

Start server locally (needs a local .env file. Use 'heroku config; to list remote config)
  - heroku local

Deploy to heroku
  - git push heroku master

