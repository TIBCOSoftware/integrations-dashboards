// https://jsforce.github.io/
const jsforce = require('jsforce');

const jefeCreds = {
  userName: process.env.JEFE_SF_USER,
  password: process.env.JEFE_SF_PASS,
  url: process.env.JEFE_SF_URL
};

const bossCreds = {
  userName: process.env.BOSS_SF_USER,
  password: process.env.BOSS_SF_PASS,
  url: process.env.BOSS_SF_URL
};

const salesforce = {};

salesforce.init = async credentials => {
  const conn = new jsforce.Connection({ loginUrl: credentials.url });
  await conn.login(credentials.userName, credentials.password);

  return conn;
};

salesforce.initBossConnection = () => {
  return salesforce.init(bossCreds);
};

salesforce.initJefeConnection = () => {
  return salesforce.init(jefeCreds);
};

salesforce.queryAll = async (salesforceConnection, queryStatement) => {
  let records = [];

  let query = await salesforceConnection.query(queryStatement);
  let { done } = query;

  records = [...records, ...query.records];

  while (!done) {
    query = await salesforceConnection.queryMore(query.nextRecordsUrl);
    records = [...records, ...query.records];
    ({ done } = query);
  }

  return records;
};

module.exports = salesforce;
