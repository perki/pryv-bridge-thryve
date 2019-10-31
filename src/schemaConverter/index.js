const definitions = require('./definitions');
const availableSources = require('./sources');
const logger = require('../logging');

const rootStream = require('../config.js').get('pryv:rootstream');
const sep = '-';

exports.rootStream = rootStream;


// --------    ACTIVE CONVERTER PART --------- //

/**
 * Counter Tool for reporting
 * @param {String} counterKey Message
 * @param {String} key identifier
 * @param {Object} context
 */
function plusOneFor(counterKey, key, context) {
  if (!context.counters) context.counters = {};
  if (!context.counters[counterKey]) context.counters[counterKey] = {};
  if (!context.counters[counterKey][key]) context.counters[counterKey][key] = 0;
  context.counters[counterKey][key]++;
}


/**
 * convert a data item from Thryve to Streams and Events data
 *
 * @param {Integer} sourceCode Thryve Data Source code
 * @param {Object} data Data as per Thryve API
 * @param {Object} context { combinations: Map {streamCode}-{type}-{time} -> {Event} }
 *
 * @return {Object} {streams: Array of streams, event: Pryv event}
 */
exports.thryveToPryv = function (sourceCode, data, context) {
  if (!context || !context.combinations) {
    throw new Error('Missing context');
  }

  let isDaily = !!data.day;

  const source = availableSources[sourceCode];
  if (!source) {
    plusOneFor('missingSourceCode', 's:' + sourceCode, context);
    //logger.warn('Cannot find sourceCode for: ' + sourceCode + ' => ' + JSON.stringify(data));
    return null;
  }

  const numCode = data[isDaily ? 'dailyDynamicValueType' : 'dynamicValueType'];
  if (!numCode) {
    plusOneFor('missingDataCode', 's:' + sourceCode, context);
    logger.warn('Cannot find dataCode for: ' + data);
    return null;
  }

  const dataCode = (isDaily ? 'd' : 'i') + numCode;
  const dataType = definitions.dataTypes[dataCode];

  if (!dataType) {
    plusOneFor('noDefinitionFor', 's:' + sourceCode + ' d:' + dataCode, context);
    logger.warn('Cannot find dataType for: ' + dataCode + ' - ' + JSON.stringify(data));
    return null;
  }

  if (dataType.type === 'ignore') {
    return null;
  }

  if (dataType.type === 'todo') {
    plusOneFor('notDocumented', 's:' + sourceCode + ' d:' + dataCode, context);
    // logger.warn('Data-Type not documented for: ' + JSON.stringify(data));
    return null;
  }


  const time = Date.parse(data[isDaily ? 'day' : 'timestamp']) / 1000;

  let {streamCode, streamName} = dataType;
  let content = dataType.converter(data);
  let eventType = '' + dataType.type;

  // This code is only valid for combination with 2 items in the content
  if (dataType.type.isCombined) {
    streamCode = dataType.type.streamCode;
    streamName = dataType.type.streamName;
    eventType = dataType.type.type;

    const combineKey = streamCode + '-' + eventType + '-' + time;
    if (!context.combinations[combineKey]) { // does not exists .. add to combinations map and skip
      context.combinations[combineKey] = {content: {}};
      context.combinations[combineKey].content[dataType.type.contentKey] = content;
      return null;
    }
    context.combinations[combineKey].content[dataType.type.contentKey] = content;
    content = context.combinations[combineKey].content;

    delete context.combinations[combineKey];
    plusOneFor('Combined', `s:${sourceCode} t:${streamCode} -> ${eventType}`, context);
  }

  const level1stream = isDaily ? {
    id: rootStream.id + sep + 'daily',
    name: 'Daily',
    parentId: rootStream.id
  } : {id: rootStream.id + sep + 'intraday', name: 'Intraday', parentId: rootStream.id};

  const level2Stream = {
    id: level1stream.id + sep + streamCode,
    name: streamName,
    parentId: level1stream.id
  };

  const level3Stream = {
    id: level1stream.id + sep + streamCode + sep + sourceCode,
    name: source,
    parentId: level2Stream.id
  };

  const event = {
    streamId: level3Stream.id,
    type: eventType,
    time: time,
    content: content
  };


  if (isDaily) {
    event.duration = 60 * 60 * 24;
  } else {
    event.duration = 60;
  }

  return { streams: [rootStream, level1stream, level2Stream, level3Stream], event: event};
};
