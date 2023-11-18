# BETTING PLATFORM SERVER

## Project Overview

This GitHub repository contains the source code for BETTING PLATFORM SERVER. Before you begin, make sure to set up the following environment variables for proper configuration.

## Configuration Variables

1. **MONGODB_URI**

   - Description: MongoDB connection URI for accessing the database.
   - Example: `mongodb+srv://doadmin:12345@db-mongodb-nyc3-dev-123.mongo.ondigitalocean.com/gen2?replicaSet=db-mongodb-nyc3-dev&tls=true&authSource=admin`

2. **MONGODB_WITH_CERT**

   - Description: Enable or disable MongoDB connection with TLS certificate.
   - Example: `true`

3. **JWT_SECRET**

   - Description: Secret key used for JSON Web Token (JWT) encryption.
   - Example: `shhhh`

4. **HOT_ADDRESS**

   - Description: Ethereum address.
   - Example: `0x12345...`

5. **HOT_ADDRESS_PKEY**

   - Description: Private key corresponding to the Ethereum address specified in HOT_ADDRESS.
   - Example: `a9d843904ecbb273f4eb8171bcb5...`

6. **DISABLE_BETS_MODULE**

   - Description: Enable or disable the bets module.
   - Example: `true`

7. **DISABLE_DEPOSITS_MODULE**

   - Description: Enable or disable the deposits module.
   - Example: `true`

8. **DISABLE_WITHDRAWALS_MODULE**
   - Description: Enable or disable the withdrawals module.
   - Example: `true`

## Getting Started

1. Clone the repository.
2. Set up the required environment variables as specified above.

## Contributing

If you would like to contribute to this project, please follow the guidelines outlined in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE.md](LICENSE.md) file for details.
