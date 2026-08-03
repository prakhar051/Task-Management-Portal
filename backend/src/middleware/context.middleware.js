import { contextStorage } from '../utils/context.js';

export const contextMiddleware = (req, res, next) => {
  contextStorage.run(req, next);
};
