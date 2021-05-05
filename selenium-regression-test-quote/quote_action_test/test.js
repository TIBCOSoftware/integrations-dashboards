import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();
import { switchAccount } from '../helper_test/switchAccount.js'
 
// Outline - quotesTest
  // take quoteId, action, profile and driver as parameters
  // check values in the quote page
  // switch to the owner account (change profile)
  // execute the action
  // log out (change profile)
  // check values
 
 
export const quotesTest = async(quoteId, action, ownerId, driver, stage) => {
 
    // all parameters
    console.log('Quote ID: ' + quoteId);
    console.log('Action: ' + action);
    console.log('Owner ID: ' + ownerId);
 
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
        await driver.quit();
        process.exit(1);
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
        await driver.quit();
        process.exit(1);
      }
 
      // try {
      //   await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000)
      //   .getText()
      //   .then(text => {
      //     if (text === 'Draft Quote') {
      //       console.log("Record Type checked before submission!");
      //     }
      //     else throw new Error('Record Type not checked bofore submission!');
      //   });
      // }
      // catch (e) {
      //   const text = await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000).getText();
      //   console.log("RecordType checked failed, RecordType - expected: Draft Quote, value: " + text);
      //   await driver.quit();
      //   process.exit(1);
      // }
 
      // log in with the owner account
      await switchAccount(quoteId, 'login', driver, ownerId);
      await driver.sleep(3000);
      await driver.navigate().refresh();
 
      // submit for approval
      await driver.sleep(2000);
      await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AASubmit']")), 15000)
        .click()
        .then(() => {
          console.log("Submitted!");
        })
      
      // check recall button
      await driver.sleep(2000);
      try {
        await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AARecall']")),15000);
      }
      catch (e) {
        console.log("Submission not finish!");
        await driver.quit();
        process.exit(1);
      }
 
      // check current account log out
      await switchAccount(quoteId, 'logout', driver, ownerId);
      await driver.sleep(3000);
      await driver.navigate().refresh();
      
      // check status & recordType after submission
      try {
        await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000))
        .getText()
        .then((text) => {
            if (text === 'Approved') {
              console.log("Status checked after submission! - Approved");
            }
            else if (text === 'In Review') {
              console.log("Status checked after submission! - In Review");
            }
            else throw new Error('Status not checked after submission!');
        });
      }
      catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000)).getText();
        console.log("Status checked failed, Status - expected: Approved/In Review, value: " + text);
        await driver.quit();
        process.exit(1);
      }
 
      try {
        await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000)
        .getText()
        .then(text => {
          if (text === 'Approved Quote') {
            console.log("Record Type checked after submission! - Approved Quote");
          }
          else if (text === 'In Progress Quote') {
            console.log("Record Type checked after submission! - In Progress Quote");
          }
          else throw new Error('Record Type not checked after submission!');
        });
      }
      catch (e) {
        const text = await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000).getText();
        console.log("RecordType checked failed, RecordType - expected: Approved Quote/In Progress Quote, value: " + text);
        await driver.quit();
        process.exit(1);
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
        await driver.quit();
        process.exit(1);
      }
 
      // check status & recordType before recalled
      try {
        await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000))
        .getText()
        .then((text) => {
            if (text === 'Approved' || text === 'In Review') {
              console.log("Status checked before recalled!");
            }
            else throw new Error('Status not checked before recalled!');
        });
      }
      catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000)).getText();
        console.log("Status checked failed, Status - expected: Approved/In Review, value: " + text);
        await driver.quit();
        process.exit(1);
      }
 
      try {
        await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000)
        .getText()
        .then(text => {
          if (text === 'Approved Quote' || text === 'In Progress Quote') {
            console.log("Record Type checked before recalled!");
          }
          else throw new Error('Record Type not checked before recalled!');
        });
      }
      catch (e) {
        const text = await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000).getText();
        console.log("RecordType checked failed, RecordType - expected: Approved Quote/In Progress Quote, value: " + text);
        await driver.quit();
        process.exit(1);
      }
 
      // log in with the owner account
      await switchAccount(quoteId, 'login', driver, ownerId);
      await driver.sleep(3000);
      await driver.navigate().refresh();
 
      // click recall button
      await driver.sleep(2000);
      await (await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AARecall']")),10000))
        .click()
        .then(() => console.log("Recalled!"));
 
      // check submit button
      await driver.sleep(2000);
      try {
        await driver.wait(until.elementLocated(By.xpath("//button[@name='SBQQ__Quote__c.AASubmit']")),15000);
      }
      catch (e) {
        console.log("Recall not finish!");
        await driver.quit();
        process.exit(1);
      }
 
      // log out
      await switchAccount(quoteId, 'logout', driver, ownerId);
      await driver.sleep(3000);
      await driver.navigate().refresh();
 
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
        await driver.quit();
        process.exit(1);
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
        await driver.quit();
        process.exit(1);
      }
    }
    else {
      console.log('Invalid action!');
      await driver.quit();
      process.exit(1);
    } 
    // await driver.quit();
}
 
// https://tibcocpq--sandbox.lightning.force.com/lightning/setup/ManageUsers/page?address=/0051I000006lPqHQAU?noredirect=1&isUserEntityOverride=1