const definitions = require('./definitions');
const logger = require('./logging');

const rootStream = 'thryve';

exports.thryveToPryv = function(sourceCode, data, isDaily) {

  const source = definitions.sources[sourceCode];
  if (! source) {
    logger.warn('Cannot find sourceCode for: ' + sourceCode);
    return null;
  }

  const dataCode = isDaily ? 'd' : 'i' + data.dynamicValueType;
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

  const level1stream = isDaily ?  { id: rootStream + '.daily', defaultName: 'Daily', parentId: rootStream } : { id: rootStream + '.intraday', defaultName: 'Intraday', parentId: rootStream };

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
    time: Date.parse(data.timestamp) / 1000,
    content: dataType.converter(data)
  }

  if (! isDaily) {
    event.duration = 60;
  }

  return {streams: [level1stream, level2Stream, level3Stream], event: event};
}