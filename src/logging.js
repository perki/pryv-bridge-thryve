const winston = require('winston');

const files = new winston.transports.File({ filename: 'logfile.log' });

const alignedWithColorsAndTime = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const {
      timestamp, level, message, ...args
    } = info;

    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
  }),
);

const color = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf((info) => {
    const {
      timestamp, level, message, ...args
    } = info;

    return `[${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
  }),
);

const myconsole = new winston.transports.Console({ format: color });



winston.add(myconsole);
winston.add(files);

module.exports = winston ;