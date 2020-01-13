import { NextFunction, Request, Response } from "express";
import { DataSourceTypes } from "../enums/DataSourceTypes";
import { DataSourceFactory } from "../datasource/DataSourceFactory";
import { DataSource } from "../interfaces/DataSource";

let dataSource: DataSource;

/**
 * POST /api/twitterTagSummary
 */
export const getTwitterTagSummary = (req: any, res: Response) => {
  if (!dataSource) dataSource = DataSourceFactory.getDataSource(<DataSourceTypes>process.env['data_source_configuration']);

  dataSource.getTwitterTagSummary(req.body).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error);
  });
};

/**
 * POST /api/initiateStream
 */
export const initiateStream = (req: any, res: Response) => {
  if (!dataSource) dataSource = DataSourceFactory.getDataSource(<DataSourceTypes>process.env['data_source_configuration']);

  dataSource.initiateStream(req.body).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error);
  });
};

/**
 * POST /api/setRunningStreamForTermination
 */
export const setTerminationFlag = (req: any, res: Response) => {
  if (!dataSource) dataSource = DataSourceFactory.getDataSource(<DataSourceTypes>process.env['data_source_configuration']);

  dataSource.setRunningStreamForTermination().then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error);
  });
};
