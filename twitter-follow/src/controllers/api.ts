import { NextFunction, Request, Response } from "express";
import { DataManager } from '../datasource/DataManager';
import { DataSourceTypes } from '../datasource/IDataSource';

let dataManager;

/**
 * POST /api/twitterTagSummary
 */
export const getTwitterTagSummary = (req: any, res: Response) => {
  if (!dataManager)  dataManager = new DataManager(<DataSourceTypes>process.env['data_source_configuration']);

  dataManager.dataSource.getTwitterTagSummary(req.body.config).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error);
  });
};

/**
 * POST /api/initiateStream
 */
export const initiateStream = (req: any, res: Response) => {
  if (!dataManager)  dataManager = new DataManager(<DataSourceTypes>process.env['data_source_configuration']);

  dataManager.dataSource.initiateStream(req.body.config).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error);
  });
};
