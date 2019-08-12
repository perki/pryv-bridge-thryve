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
  }
}
```

## API

### Add User

==>   `POST /user`

Content: 

```json
{
  "pryv": "https://{pryvtoken}@{pryvuser}.{domain}",
  "thryveToken": "{thryvToken}"
}
```

## Run

`npm start`

## Test

`npm test`

# Dev

Node.js Express APP. 

Stores Pryv-user // Thryve Token in a local sqlite Database

Definitions on how to convert Thryve DataType to Pryv are located in definitions.js file 

