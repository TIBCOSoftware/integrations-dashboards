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

quotesTest = async(quoteId) => {

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

    // check if the approval is recalled
    try {
      submit = await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AASubmit']")), 15000)
    }
    catch (e) {
      console.log("Already Submitted!")
    }

    // check status & recordType before submission
    await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 15000))
      .getText()
      .then((text) => {
        if (text === '' || text === 'Draft') {
          console.log("Status checked before submission!");
        }
        else throw new Error('Status not checked bofore submission!');
      });

    await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 15000)
      .getText()
      .then(text => {
        if (text === 'Draft Quote') {
          console.log("Record Type checked before submission!");
        }
        else throw new Error('Record Type not checked bofore submission!');
      });
    
    // submit for approval
    await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AASubmit']")), 15000)
      .click()
      .then(() => {
        console.log("Submitted!");
      })
    
    // check recall button
    await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AARecall']")),15000);
    
    // check status & recordType after submission
    await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 15000))
      .getText()
      .then((text) => {
        if (text === 'Approved') {
          console.log("Status checked after submission!");
        }
        else throw new Error('Status not checked after submission!    ' + text);
      })
      .catch(e => {
        console.log(e);
      });

    await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 15000)
      .getText()
      .then(text => {
        if (text === 'Approved Quote') {
          console.log("Record Type checked after submission!");
        }
        else throw new Error('Record Type not checked after submission!');
      })
      .catch(e => {
        console.log(e);
      });

    driver.quit();
}

// all quotes need to be tested
const quoteIds = ['a0p6s000000tdivAAA'];
quoteIds.forEach(id => {
    quotesTest(id);
})
