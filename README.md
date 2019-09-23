# Bridge Thryve <> Pryv

Exploratory work for bridge between Pryv API and Thryve API.

## Install 

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
} 
```



## Thryve EventTrigger

Thryve can send notification for every new data. 

These notifications should be sent to `POST /trigger`

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

- Handle paired code 1401 & 1402 for Latitude / Longitude

# Copyright & License

Copyright (C) 2019 Pierre-Mikael Legris - All Rights Reserved.  

You may use, distribute and modify this code under the terms of the GL3 license.
You should have received a copy of the GPL3 license with these files.
