const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI, {
    ssl: true,
    sslValidate: true,
    // For example, see https://medium.com/@rajanmaharjan/secure-your-mongodb-connections-ssl-tls-92e2addb3c89
    // for where the `rootCA.pem` file comes from.
    // Please note that, in Mongoose >= 5.8.3, `sslCA` needs to be
    // the **path to** the CA file, **not** the contents of the CA file
    sslCA: `${__dirname}/ca-certificate.crt`,
  })
  .catch((err) => console.log(err.reason));
