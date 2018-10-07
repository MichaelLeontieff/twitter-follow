import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as logger from "morgan";

const app = express();
app.use(express.static('serve/client'));
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
      this.express.set("port", process.env.PORT || 3000);
      
      this.express.use(logger("dev"));
      this.express.use(bodyParser.json());
      this.express.use(bodyParser.urlencoded({ extended: true }));
    }
    
    /**
     * Primary app routes.
     */
    private routes(): void {
      //this.express.use("/", rootRouter);
      //this.express.use("/api", apiRouter);
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
  