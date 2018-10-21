import * as express from 'express';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as oauth from 'oauth';
import * as logger from 'morgan';
import * as request from 'request';
import Twitter = require('twitter');
import * as natural from 'natural';
import * as redis from 'redis';

import apiRouter from './routes/api';

dotenv.config({ path: __dirname + "/.env.configuration" });

class App {

    // ref to Express instance
    public express: express.Application;
  
    constructor() {
      this.express = express();
      this.middleware();
      this.routes();
      this.launchConf();
  
    }
    private middleware(): void {
      this.express.set("port", process.env.PORT || 8000);
      
      this.express.use(logger("dev"));
      this.express.use(bodyParser.json());
      this.express.use(bodyParser.urlencoded({ extended: true }));
      this.express.use(session({ secret: "very secret", resave: false, saveUninitialized: true}));
    }
    
    /**
     * Primary app routes.
     */
    private routes(): void {
      this.express.use("/api", apiRouter);
      this.express.use("/", express.static('client'));
    }
  
    private launchConf() {
  
      /**
       * Start Express server.
       */
      this.express.listen(this.express.get("port"), () => {
        console.log(("  App is running at http://localhost:%d \
        in %s mode"), this.express.get("port"), this.express.get("env"));
        console.log("  Press CTRL-C to stop\n");
      });
    }
}
  
export default new App().express;
  