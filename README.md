# Mirror
### Bot, API and Dashboard for Discord Bot

### Enviromental Variables

- **Development**: Change the `.env.example` file to `.env` and fill in the environmental variables
- **Production**: Install pm2 globally `npm i pm2 -g`, change the `ecosystem.config.js.example` file to `ecosystem.config.js` and fill in the environmental variables
- **Docker**: Use an .env file with docker-compose. Docker setup coming soon...

### Installation

Install the dependencies and devDependencies and start the server.

```sh
$ cd mirror
$ npm install -d
$ npm run server
```

For production environments...

```sh
$ npm install --production
$ npm start
```