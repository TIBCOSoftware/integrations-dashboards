const fs = require('fs');
const AdmZip = require('adm-zip');
const manifest = require('./manifest.json');

const buildAgent = {};

buildAgent.init = () => {
  const taskName = process.argv[2];
  buildAgent.createZipFile(taskName);
};

buildAgent.createZipFile = taskName => {
  const zip = new AdmZip();

  const files = fs.readdirSync('./');
  console.log(files);
};

buildAgent.init();
