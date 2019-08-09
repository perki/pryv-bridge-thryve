const definitions = require('./definitions');
const logger = require('./logging');

const rootStream = {id: 'thryve', defaultName: 'Thryve'};

exports.rootStream = rootStream;

/**
 * convert a data item from Thryve to Streams and Events data
 * 
 * @param {Integer} sourceCode Thryve Data Source code
 * @param {Object} data Data as per Thryve API
 * 
 * @return {Object} {streams: Array of streams, event: Pryv event}
 */
exports.thryveToPryv = function(sourceCode, data) {

  let isDaily = false;
  if (data.day) { isDaily = true; }

  const source = definitions.sources[sourceCode];
  if (! source) {
    logger.warn('Cannot find sourceCode for: ' + sourceCode);
    return null;
  }

  const numCode = data[isDaily ? 'dailyDynamicValueType' : 'dynamicValueType'];
  if (! numCode) {
    logger.warn('Cannot find dataCode for: ' + data);
    return null;
  }

  const dataCode = (isDaily ? 'd' : 'i') + numCode;
  const dataType = definitions.dataTypes[dataCode];

  if (!dataType) {
    logger.warn('Cannot find dataType for: ' + dataCode + ' - ' + JSON.stringify(data));
    return null;
  }

  if (dataType.type === 'ignore') {
    return null;
  }

  if (dataType.type === 'todo') {
    logger.warn('Data-Type not documented for: ' + JSON.stringify(data));
    return null;
  }

  const level1stream = isDaily ? { id: rootStream.id + '.daily', defaultName: 'Daily', parentId: rootStream.id } : { id: rootStream.id + '.intraday', defaultName: 'Intraday', parentId: rootStream.id };

  const level2Stream = {
    id: level1stream.id + '.' + dataType.streamCode,
    defaultName: dataType.streamName,
    parentId: level1stream.id
  }

  const level3Stream = {
    id: level1stream.id + '.' + dataType.streamCode + '.' + sourceCode,
    defaultName: source,
    parentId: level2Stream.id
  }

  const event = { 
    streamId: level3Stream.id,
    type: dataType.type,
    time: Date.parse(data[isDaily ? 'day' : 'timestamp']) / 1000,
    content: dataType.converter(data)
  }


  if (isDaily) {
    event.duration = 60 * 60 * 24;
  } else {
    event.duration = 60;
  }

  return { streams: [rootStream, level1stream, level2Stream, level3Stream], event: event};
}