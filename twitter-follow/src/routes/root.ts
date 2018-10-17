import { NextFunction, Request, Response, Router } from "express";

class Root {
  public router: Router;
  public constructor() {
    this.router = Router();
    this.init();
  }
  private init() {
    this.router.get("*", (req, res) => {
      res.send("Page not Found");
    });
  }
}

const rootRoutes = new Root();
export default rootRoutes.router;
