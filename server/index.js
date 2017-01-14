
import express from 'express';
import compression from 'compression';
import flash from 'connect-flash';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import httpLogger from 'morgan';
import winston from 'winston';
import expressWinston from 'express-winston';
import errorHandler from 'errorhandler';
import responseTime from 'response-time';
import expressValidator from 'express-validator';
import methodOverride from 'method-override';
import helmet from 'helmet';
// import session from 'express-session';
// import passport from 'passport';
import uuid from 'uuid';
import schedule from 'node-schedule';
import logger from './lib/logger';
global.logger = logger;
import corsManager from './middleware/corsManager';
import api from './api';
import genStaticAPIForFeatTask from './task/genStaticAPIForFeat';
import * as validators from './lib/validators';
import connectServices from './lib/connectServices';

const isProductionEnv = process.env.NODE_ENV === 'production';
const app = express();

app.disable('x-powered-by');
app.enable('trust proxy');
app.set('port', process.env.PORT || 8080);
app.use(responseTime());
app.use(compression());
app.use(flash());
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressValidator({
  customValidators: validators,
}));
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.noCache());

const corsConfig = {
  whitelist: [
    'https://sapp.flipchina.cn',
    'http://sapp.flipchina.cn',
    'https://sapp.staging.flipchina.cn',
    'http://sapp.staging.flipchina.cn',
    'http://localhost:8002',
  ],
};
app.use(corsManager(corsConfig));
app.options('*', corsManager(corsConfig));

app.use((req, res, next) => {
  res.header('Request-Id', uuid.v4());
  next();
});
httpLogger.token('id', (req, res) => res.get('Request-Id'));
const httpLoggerConfig = {
  stream: logger.stream,
  skip(req) {
    return req.path === '/stat';
  },
};
const httpLoggerFormat = '[:id] :response-time ms | :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
app.use(httpLogger(httpLoggerFormat, httpLoggerConfig));

app.get('/stat', (req, res) => {
  res.json({
    status: 0,
  });
});

app.get('/inspect', (req, res) => {
  const {
    id,
    responseTime,
    baseUrl,
    protocol,
    hostname,
    ip,
    ips,
  } = req;
  res.json({
    id,
    responseTime,
    matchedPattern: req.app.mountpath,
    matchedUrl: baseUrl,
    protocol,
    hostname,
    ip,
    ips,
  });
});

app.use('/api', api);

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.FL_ENABLE_VERBOSE_LOG ? 'verbose' : 'info',
      colorize: false,
      json: true,
      prettyPrint: false,
      humanReadableUnhandledException: false,
    }),
  ],
}));

if (!isProductionEnv) {
  app.use(errorHandler());
}

app.use(function (err, req, res, next) {
  if (err && (!next || res.headersSent)) {
    return;
  }
  res.sendStatus(500);
});

Promise.all(connectServices).then(() => {
  app.listen(app.get('port'), () => {
    logger.info('Started on port %d in %s mode',
      app.get('port'), app.get('env'));
  });
});

if (process.env.FL_ENABLE_NODE_SCHEDULE_JOB === '1') {
  // https://www.npmjs.com/package/node-schedule
  // https://github.com/harrisiirak/cron-parser
  // timezone configures in Dockerfile
  schedule.scheduleJob('0 0 4 * * *', genStaticAPIForFeatTask);
}

export default app;
