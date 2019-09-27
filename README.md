# Bridge Thryve <> Pryv

Exploratory work to bridge Pryv API & Thryve API.

## How it works.

```

   Thryve API ---> Bridge ---> Pryv API

```

# API

## Add User

==>   `POST /user`

Content: 

```json
{
  "pryv": "https://{pryvtoken}@{pryvuser}.{domain}",
  "thryveToken": "{thryvToken}",
}
```

**Important**: The pryvToken should have the necessary credentials to create events and streams in a stream with the id: `thryve`
This stream can be configured by adding in config.json:

```json
"pryv": {
    "rootstream": { "id": "thryve", "name": "Thryve" }
} `
```

## Thryve EventTrigger

Thryve can send notification for every new data. 

These notifications should be sent to `POST /trigger`

# Install 

1. `npm update`
2. Create a config.json file with the following informations

```json
{
  "thryve": {
    "auth": {"user": "...", "password": "..."},
    "appId": "..."
  },
  "test": {
    "users": [{
      "thryveToken" : "{thryvToken}",
      "pryvEndpoint": "https://{pryvtoken}@{pryvuser}.{domain}"
      }
    ]
  }
}
```

Optionaly you can add your own user to run tests

# Run

`npm start`

## Test

Complete the config.json with a valid Pryv endpoint and Thryve token

`npm test`

# Dev

Node.js Express APP. 

Stores Pryv-user // Thryve Token in a local sqlite Database

Definitions on how to convert Thryve DataType to Pryv are located in schemaConverters/definitions.js file.

## Todo

- Complete definitions.js file with corresponding event-types.

- Find a robust synchronisation schema. 

  We cannot use the latest timestamp to synchronize. So we might want to synchronize each source based on the latest timestamp for each of them. I origianlly planned to used the local DB to do this, but it will be more efficient to store these synchro informations on the streams client datas.

- Handle paired code 1200 & 1201 Activity details & similiars

# Synchro questions

###Thryve - Destination (Dest) synchronization: 

Goal, store in "Dest" data from Thryve with the following objectives:

- data is available in Dest as soon as possible
- no "missing" data in Dest. (Data in Thryve and not Dest)
- no "double" entries in Dest. (Add data in Dest that has already been loaded before)

###Current implemention. 

A bridge service (Bridge) between Thryve & Pryv

1. When adding a new user (couple ThryveToken / Dest user ID). The Bridge fetches all data from very far in the past to now for all source.
2. The service Exposes a /trigger route that fetches exactly the segment of data `from`, `to` and `source` received.

### Questions for further implementations

1. Fact: Some DataSources or ValueTypes are not advertised by the EventTrigger service. 

   This means that a side synchronization mechanism should be put in place to regularly check for new data. 

   The  development plan for this part is 

   - For each user keep a list of the Data Endpoint (EventTrigger/DataSource) to fetch automatically with the last sync time
   - Regularly call the Thryv API to fetch eventual new data for each of them and update last sync time per Data Endpoint

   Questions: 

   - Is the EventTrigger service 100% per DataSource? or is per DataSource/EventTypes? (If per DataSource the implementations and number of call will be highly reduced)
   - Is there a list of DataSources or DataSource/EventTypes that are not covered by EventTrigger? 
     This will make it easier to implement instead of having some "discovery method". 

2. Optimisation of the synchronization

   - To avoid requesting for unavailable data what is the preffered way to know if DataSources are available?
     We tried to use the UserInformations endpoint, but it was not advertising all sources that could be found with a wide DynamicValue call.  

3. Question: How can we ensure that the bridge does not miss data "Inserted" in a previous timeFrame.

   Case: EventTrigger for a DataSource A is fired with a fromTime midnight today to noon today. 

   - Can we be sure that no data for this source will be added in this time frame?
   - If new data would be inserted for that source in this time frame, will this trigger a new EventTrigger for that source?

     This could result in fetching some data twice. Is there a way to prevent this? 


# Copyright & License

Copyright (C) 2019 Pierre-Mikael Legris - All Rights Reserved.  

You may use, distribute and modify this code under the terms of the GL3 license.
You should have received a copy of the GPL3 license with these files.
