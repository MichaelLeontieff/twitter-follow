import { NextFunction, Request, Response } from "express";
import { DataManager } from '../datasource/DataManager';
import { DataSourceTypes } from '../datasource/IDataSource';

const dataManager = new DataManager(<DataSourceTypes>process.env['data_source_configuration']);

/**
 * POST /api/twitterTagSummary
 */
export const getTwitterTagSummary = (req: any, res: Response) => {
  dataManager.dataSource.getTwitterTagSummary(undefined).then(response => {
    res.json(response);
  }).catch(error => {
    res.json(error);
  });
};
