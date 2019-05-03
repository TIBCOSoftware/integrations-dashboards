const dbConnections = require('../../db/connections');

class LicenseIntegration {
  async run() {
    const dbConnection = await dbConnections.initProduction();

    const val = await dbConnection.query('SELECT * FROM Product');
    console.log(JSON.stringify(val, null, 2));

    dbConnection.end();

    // this.getBOSSLicenses()
    // |-> this.insertBOSSLicenseToDW()
  }
}

module.exports = new LicenseIntegration();
