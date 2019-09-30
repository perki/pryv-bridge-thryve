# Bridge Thryve <> Pryv

Exploratory work to bridge Pryv API & Thryve API.

## How it works.

```

Thryve API ---> Bridge ---> Pryv API

```

# API

## Add User

==>   `POST /user`

Content: 

```json 
{"pryv": "https://{pryvtoken}@{pryvuser}.{domain}",   "thryveToken": "{thryvToken}", }
```

**Important**: The pryvToken should have the necessary credentials to create events and streams in a stream with the id: `thryve` This stream can be configured by adding in config.json:

```json 
"pryv": {     "rootstream": { "id": "thryve", "name": "Thryve" } } 
```

## Thryve EventTrigger

Thryve can send notification for every new data. 

These notifications should be sent to `POST /trigger`

# Install 

1. `npm update`
2. Create a config.json file with the following information

```json 
{
  "thryve": {     
    "auth": {
      "user": "...", 
      "password": "..."
      },     
      "appId": "..."
  },
  "test": {     
    "users": [{       
      "thryveToken" : "{thryvToken}",       
      "pryvEndpoint": "https://{pryvtoken}@{pryvuser}.{domain}"       
      }     ]   
  } 
}
```

Optionaly you can add your own user to run tests

# Run

`npm start`

The server will listen on the port specified in the configuration. Default = 2606.  

To run in production an SSL termination should be set up with a reverse proxy such as nginx.

## Test

Complete the config.json with a valid Pryv endpoint and Thryve token.

Warning: Test order is not polished and it could take several "passes" to get them to work.

`npm test`

# Dev

Node.js Express APP. 

Stores Pryv-user // Thryve Token in a local sqlite Database

### Definitions.js 

Definitions on how to convert Thryve DataType to Pryv are located in schemaConverters/definitions.js file.

#### DataSources

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

#### Conversion logic

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

#### Combined measures

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


## Todo

- Complete definitions.js file with corresponding event-types.

- Find a robust synchronization schema. 

We cannot use the latest timestamp to synchronize. So we might want to synchronize each source based on the latest timestamp for each of them. I originally planned to use the local DB, but it will be more efficient to store these synchro information on the streams client data.

- Handle paired code 1200 & 1201 Activity details & similar

# Synchro questions

###Thryve - Destination (Dest) synchronization: 

Goal, store in "Dest" data from Thryve with the following objectives:

- data is available in Dest as soon as possible
- no "missing" data in Dest. (Data in Thryve and not Dest)
- no "double" entries in Dest. (Add data in Dest that has already been loaded before)

###Current implemention. 

A bridge service (Bridge) between Thryve & Pryv

1. When adding a new user (couple ThryveToken / Dest user ID). The Bridge fetches all data from very far in the past to now for all source.
2. The service exposes a /trigger route that fetches exactly the segment of data `from`, `to` and `source` received.

### Questions for further implementations

1. Fact: Some DataSources or ValueTypes are not advertised by the EventTrigger service. 

This means that a side synchronization mechanism should be put in place to regularly check for new data. 

The  development plan for this part is 

- For each user keep a list of the Data Endpoint (DataSource/ValueTypes) to fetch automatically with the last sync time
- Regularly call the Thryv API to fetch eventual new data for each of them and update last sync time per Data Endpoint

Questions: 

- Is there a list of DataSources or DataSource/EventTypes that are not covered by EventTrigger? 
This will make it easier to implement instead of having some "discovery method". 

2. Fact: New measures can be "inserted" at any moment between (in a time scope) measures that have already been fetched by the bridge. There is no synchronization mechanism on Thryve, this means that the only way to detect if a measure has already been synchronized is to look for existing identical measure (type, time, streamId). This also applies to modification of measure. 

In the scope of this implementation in would mean that the Bridge should have access to all previously fetched measure at every moment. As this is not possible for compliance and technical reasons, we have to limit the synchronization capabilities of the Bridge. 

If Thryve in the future implements some synchronization capabilities such as:

- a modified and/or creation date to check with the last synchronization point 
- an "anchor" as per Apple HealthKit 

Then much of this discussion and implementation mechanism could be removed or simplified. 

3. Optimization of the synchronization

- To avoid requesting for unavailable data what is the preferred way to know if DataSources are available?
We tried to use the UserInformations endpoint, but it was not advertising all sources that could be found with a wide DynamicValue call.  

# Copyright & License

Copyright (C) 2019 Pierre-Mikael Legris - All Rights Reserved.  

You may use, distribute and modify this code under the terms of the GL3 license.
You should have received a copy of the GPL3 license with these files.

