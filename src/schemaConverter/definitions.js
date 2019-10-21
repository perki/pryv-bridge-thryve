const logger = require('../logging');

const dataTypesCSV = require('./dataTypesCSV');

/**
 - Definitions syntax and how to update this document can be found in README.md
 **/

const converters = {
  'DOUBLE': data => +data.value,
  'LONG': data => +data.value,
  'NONE': data => null,
  'BOOLEAN': data => data.value === 'true',
  'ACT-1': data => {}, // TODO
  'STRING': data => data
};

const detailedCodes = {
  'x1200': {
    'i102': 'Sleep',
    'i103': 'Doffed',
    'i104': 'Active',
    'i105': 'Walk',
    'i106': 'Run',
    'i107': 'Bike',
    'i108': 'Transport' // todo check
  }
};


const dataTypes = {};
dataTypesCSV.map(function(line) {
  const sline = line.split(';');
  let hcode = null;
  if (sline[2] === 'Daily') hcode = 'd';
  if (sline[2] === 'Intraday') hcode = 'i';
  if (!hcode || sline.length !== 6) {
    logger.warn('Invalid line in dataTypes definitions: ' + line);
    return;
  }

  const converter = converters[sline[4]];
  if (!converter) {
    //  logger.warn('Cannot find converter for definition: ' + line);
    return;
  }

  let type = sline[5];
  if (sline[5].startsWith('combine')) {
    const combine = sline[5].split(':');

    type = {
      isCombined: true,
      type: combine[2],
      streamName: toName(combine[1]),
      streamCode: toSnake(combine[1]),
      contentKey: combine[3]
    }
  }

  dataTypes[hcode + sline[0]] = {
    streamCode: toSnake(sline[1]),
    streamName: toName(sline[1]),
    type: type,
    converter: converter
  };
});

exports.dataTypes = dataTypes;

function toSnake(s) {
  return s.replace(/(?:^|\.?)([A-Z])/g, function (x, y) {
    return "-" + y.toLowerCase()
  }).replace(/^_/, "").substring(1);
}

function toName(s) {
  return s.replace(/(?:^|\.?)([A-Z])/g, function (x, y) {
    return " " + y
  }).replace(/^_/, "").substring(1);
}
