# Bridge Thryve <> Pryv

Exploratory work to bridge Pryv API & Thryve API.

## How it works.

```

Thryve API ---> Bridge ---> Pryv API

```

# API

## Add User

==>   `POST /user`

Content: 

```json 
{
	"thryveToken": {ThryveToken},
    "pryvToken": {PryvToken},
    "pryvUsername": {PryvUsername}
}
```

# Install 

1. `npm install`
2. Create a config.json file in the project _config_ folder with the following information

```json 
{
  "server": {
    "port": 3000,
    "ip": "127.0.0.1"
  },
  "db": {
    "path": "./dthx.sqlite"
  },
  "thryveAPI": {
    "userInfo": "https://service.und-gesund.de/restjson/userInformation",
    "dynamicValues": "https://service.und-gesund.de/restjson/v5/dynamicEpochValues",
    "dailyDynamicValues": "https://service.und-gesund.de/restjson/v4/dailyDynamicValues"
  },
  "thryve": {
    "auth": {
      "user": "*****",
      "password": "*****"
    },
    "appId": "yDAawWK9r2FxqQbR",
    "appSecret": "v57D373ug8raPUzk"
  },
  "priv": {
    "baseDomen": "obpmprod.ch"
  },
  "cron": {
    "run": "*/1 * * * *",
    "period": -1,
    "enabled": false
  },
  "trigger": {
    "enabled": true,
    "authKey": "*******"
  }
}

```

Optionally you can add your own user to run tests

# Run

`npm start`


The server will listen on the port specified in the configuration. Default = 2606.  

To run in production an SSL termination should be set up with a reverse proxy such as nginx.

# Run on production server

1. As prerequisite PM2 manager should already installed (https://pm2.keymetrics.io)
2. Go to project folder
3. `pm2 start index.js`

# Update project on production server

1. go to project folder
2. `git pull origin <branch>` or simple `git pull`
3. `pm2 restart index`

# Monitoring on production

Run `pm2 monit`


# PM2 logging

Logs are located in ~/.pm2/logs folder


## Definitions.js 

Definitions on how to convert Thryve DataType to Pryv are located in schemaConverters/definitions.js file.

### DataSources

On thryve "Sources" are given by numbers, this is set with the following list. 
DataSource codes correspond to their positions. 

Apple's Thryve DataSource code is `5`. `sources[5] => "Apple"`

```javascript 
exports.sources = ["Dummy","Fitbit","Garmin","Polar","UNUSED", "Apple", ..];
```

Maps Thryve => Pryv

The array defines how to "Map" Data from Thryve to Pryv

```javascript 
const dataTypesCSV = ["1000;Steps;Daily;sum of steps;LONG;count/steps",   "1000;Steps;Intraday;sum of steps (in this minute);LONG;count/steps",   "1001;CoveredDistance;Daily;covered distance in meters;LONG;length/m",

```

A line is decomposed as:

```
 {ThryveCode};{Name in CamelCase};{Daily or Intraday};{description};{type};{Pryv event/type} 
```

Implemented types are: 

```
LONG, DOUBLE, BOOLEAN 
```

### Conversion logic

A measure will be stored in the following structure of streams:

```
{RootStream}/{Daily or Intraday}/{Name}/{Source} 
```

For example, Indraday Steps from Fitbit will be stored as the following event

```javascript { 
  time: thryveMeasure.time,   
  type: 'count/steps',   
  content: thryveMeasure.value,   
  streamId: 'tryve-intraday-steps-1' }
```

And the necessary stream structure will be

```javascript 
[
{
  id: 'thryve-intraday',
  name: 'Intraday',     
  parentId: 'thryve'   },
{
  id: 'thryve-intraday-steps',
  name: 'Steps',     
  parentId: 'thryve-intraday'   },
{
  id: 'thryve-intraday-steps-1',
  name: 'Fitbit',     
  parentId: 'thryve-intraday-steps'   
  } 
]
```

### Combined measures

Some measure send by Thryve need to be paired. For example the Geolocation which is sent in two separated items.

The bridge has a specific declaration process to handle them in the definition.js file

```javascript
  ["1401;GeolocationLatitude;Intraday;ZZZ;LONG;combine:Geolocation:position/wgs84:latitude",
  "1402;GeolocationLongitude;Intraday;ZZZ;LONG;combine:Geolocation:position/wgs84:longitude"]
```

The item at position `6` has the following syntax:

```
 combine:{Name}:{Pryv event type}:{Pryv event content property}
```

Measure will be kept in memory up to the finding of their counterpart, then merged.

# Copyright & License

Copyright (C) 2019 Pierre-Mikael Legris - All Rights Reserved.  

You may use, distribute and modify this code under the terms of the GL3 license.
You should have received a copy of the GPL3 license with these files.

