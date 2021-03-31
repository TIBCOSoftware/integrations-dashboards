const {Builder, By, Key, until} = require('selenium-webdriver');
require('chromedriver');
const Assert = require('assert');
require('dotenv').config();

const account = process.env.ACCOUNT;
const password = process.env.PASSWORD;

test = () => {
    console.log(typeof(account));
    console.log(typeof(password));
}

// test();

quotesTest = async(quoteId, action) => {

    // open the sandbox
    let driver = new Builder().forBrowser('chrome').build();
    await driver.get('https://tibcocpq--sandbox.lightning.force.com/lightning/page/home');

    // log in with email and password
    await driver.findElement(By.css('#email')).sendKeys(account);
    await driver.findElement(By.css('#next')).click();
    await driver.wait(until.elementLocated(By.css('#password'))).sendKeys(password);
    await driver.wait(until.elementLocated(By.css('#taLogin'))).click();

    // get quote by url (id)
    await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');

    // action: submit --- check - submit - check
    if (action === 'submit') {

      // validate the submit button
      try {
        await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AASubmit']")), 15000)
      }
      catch (e) {
        console.log("Already Submitted!");
        driver.quit();
        return;
      }

      // check status & recordType before submission
      try {
        await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000))
        .getText()
        .then((text) => {
            if (text === '' || text === 'Draft') {
              console.log("Status checked before submission!");
            }
            else throw new Error('Status not checked bofore submission!');
        });
      }
      catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000)).getText();
        console.log("Status checked failed, Status - expected: Draft or empty, value: " + text);
        driver.quit();
        return;
      }

      try {
        await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000)
        .getText()
        .then(text => {
          if (text === 'Draft Quote') {
            console.log("Record Type checked before submission!");
          }
          else throw new Error('Record Type not checked bofore submission!');
        });
      }
      catch (e) {
        const text = await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000).getText();
        console.log("RecordType checked failed, RecordType - expected: Draft Quote, value: " + text);
        driver.quit();
        return;
      }
      
      // submit for approval
      await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AASubmit']")), 15000)
        .click()
        .then(() => {
          console.log("Submitted!");
        })
      
      // check recall button
      try {
        await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AARecall']")),15000);
      }
      catch (e) {
        console.log("Submission not finish!");
        driver.quit();
        return;
      }
      
      // check status & recordType after submission
      try {
        await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000))
        .getText()
        .then((text) => {
            if (text === 'Approved') {
              console.log("Status checked after submission!");
            }
            else throw new Error('Status not checked after submission!');
        });
      }
      catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000)).getText();
        console.log("Status checked failed, Status - expected: Approved, value: " + text);
        driver.quit();
        return;
      }

      try {
        await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000)
        .getText()
        .then(text => {
          if (text === 'Approved Quote') {
            console.log("Record Type checked after submission!");
          }
          else throw new Error('Record Type not checked after submission!');
        });
      }
      catch (e) {
        const text = await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000).getText();
        console.log("RecordType checked failed, RecordType - expected: Approved Quote, value: " + text);
        driver.quit();
        return;
      }
    }

    // action: recall --- check - submit - check - recall - check
    else if (action === 'recall') {

      // validate the recall button
      try {
        await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AARecall']")), 15000)
      }
      catch (e) {
        console.log("Already Recalled!");
        driver.quit();
        return;
      }

      // check status & recordType before recalled
      try {
        await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000))
        .getText()
        .then((text) => {
            if (text === 'Approved') {
              console.log("Status checked before recalled!");
            }
            else throw new Error('Status not checked before recalled!');
        });
      }
      catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000)).getText();
        console.log("Status checked failed, Status - expected: Approved, value: " + text);
        driver.quit();
        return;
      }

      try {
        await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000)
        .getText()
        .then(text => {
          if (text === 'Approved Quote') {
            console.log("Record Type checked before recalled!");
          }
          else throw new Error('Record Type not checked before recalled!');
        });
      }
      catch (e) {
        const text = await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000).getText();
        console.log("RecordType checked failed, RecordType - expected: Approved Quote, value: " + text);
        driver.quit();
        return;
      }

      // click recall button
      await (await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AARecall']")),10000))
      .click()
      .then(() => console.log("Recalled!"));

      // check submit button
      try {
        await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AASubmit']")),15000);
      }
      catch (e) {
        console.log("Recall not finish!");
        driver.quit();
        return;
      }

      // check status & recordType after recalled
      try {
        await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000))
        .getText()
        .then((text) => {
            if (text === '' || text === 'Draft') {
              console.log("Status checked after recalled!");
            }
            else throw new Error('Status not checked after recalled!');
        });
      }
      catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000)).getText();
        console.log("Status checked failed, Status - expected: Draft or empty, value: " + text);
        driver.quit();
        return;
      }

      try {
        await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000)
        .getText()
        .then(text => {
          if (text === 'Draft Quote') {
            console.log("Record Type checked after recalled!");
          }
          else throw new Error('Record Type not checked aafter recalled!');
        });
      }
      catch (e) {
        const text = await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000).getText();
        console.log("RecordType checked failed, RecordType - expected: Draft Quote, value: " + text);
        driver.quit();
        return;
      }
    }
    else console.log('Invalid action!');
    driver.quit();
}

const args = process.argv.slice(2);
quotesTest(args[0], args[1]);
// args.forEach(arg => {
//     console.log(arg);
//     quotesTest(arg);
// });

// node quotesTest a0p1I000008UOIOQA4 submit