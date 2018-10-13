import * as express from 'express';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as oauth from 'oauth';
import * as logger from 'morgan';
import * as request from 'request';
import Twitter = require('twitter');
import * as natural from 'natural';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

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
      //this.express.use("/", rootRouter);
      //this.express.use("/api", apiRouter);
    }
  
    private launchConf() {
      this.oauthTest();
      this.twitterStreamTest();
      this.twitterAPITest();
      this.sentimentAnalysisTest();
  
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

  private twitterStreamTest() {
    this.express.get('/twitter/stream', (req, res) => {

        let client = new Twitter({
            consumer_key: process.env.twitter_consumer_key,
            consumer_secret: process.env.twitter_consumer_secret,
            access_token_key: process.env.twitter_access_token_key,
            access_token_secret: process.env.twitter_access_token_secret
            //bearer_token: process.env.twitter_bearer_token
        });

        let stream = client.stream('statuses/filter', {track: 'javascript'});
        let record;

        stream.on('data', (event) => {
          record = event;
          record && res.json(record);
          stream.destroy();
        });

        stream.on('error', (error) => {
          record = error;
          record && res.json(record);
        });

        
    });
  }

  private twitterAPITest() {
    this.express.get('/twitter/api', (req, res) => {

        let client = new Twitter({
            consumer_key: process.env.twitter_consumer_key,
            consumer_secret: process.env.twitter_consumer_secret,
            bearer_token: process.env.twitter_bearer_token
        });

        var req = client.get('search/tweets', {q: 'javascript'}, (error, tweets, response) => {
            console.log(error, tweets, response);
            res.json(tweets);
        });
    });
  }

  private sentimentAnalysisTest() {
    let Analyzer = natural.SentimentAnalyzer;
    let stemmer = natural.PorterStemmer;
    let analyzer = new Analyzer("English", stemmer, "afinn")
    console.log(analyzer.getSentiment(["I", "hate", "cherries"]));
  }
}
  
export default new App().express;
  