import * as express from 'express';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as oauth from 'oauth';
import * as logger from 'morgan';
import * as request from 'request';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

dotenv.config({ path: ".env.configuration" });

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
      //this.express.use("/", rootRouter);
      //this.express.use("/api", apiRouter);
    }
  
    private launchConf() {
      this.oauthTest();
  
      /**
       * Start Express server.
       */
      this.express.listen(this.express.get("port"), () => {
        console.log(("  App is running at http://localhost:%d \
        in %s mode"), this.express.get("port"), this.express.get("env"));
        console.log("  Press CTRL-C to stop\n");
      });
    }

  private oauthTest() {
    this.express.get('/twitter/authenticate', (req, res) => {
      let encode_secret = new Buffer(process.env.twitter_consumer_key + ':' + process.env.twitter_consumer_secret).toString('base64');

      let options = {
        url: 'https://api.twitter.com/oauth2/token',
        headers: {
            'Authorization': 'Basic ' + encode_secret,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
        body: 'grant_type=client_credentials'
      };

      request.post(options, (err, response, body) => {
        if (err) {
          throw new Error("Failed to fetch bearer token for twitter");
        } else {
          process.env.twitter_bearer_token = JSON.parse(body).access_token;
          res.json(body);
        } 
      });

    });
  }
}
  
export default new App().express;
  