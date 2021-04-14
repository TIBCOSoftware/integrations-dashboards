import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();
 
const account = process.env.ACCOUNT;
const password = process.env.PASSWORD;
 
// Outline - quotesTest
  // take quoteId, action, profile and driver as parameters
  // check values in the quote page
  // switch to the owner account (change profile)
  // execute the action
  // log out (change profile)
  // check values
 
 
let owner = '';
let origin_profile = '';

 
export const quotesTest = async(quoteId, action, profile, driver) => {
 
    // all parameters
    console.log('Quote Id: ' + quoteId);
    console.log('Action: ' + action);
    console.log('Profile: ' + profile);
 
    // open the sandbox
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
        await driver.quit();
        process.exit(1);
      }

      // log in with the owner account
      await switchAccount(quoteId, 'login', driver, profile);

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
        await driver.quit();
        process.exit(1);
      }
 
      // check current account log out
      await switchAccount(quoteId, 'logout', driver, profile);
      
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
      await switchAccount(quoteId, 'login', driver, profile);
 
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
        await driver.quit();
        process.exit(1);
      }
 
      // log out
      await switchAccount(quoteId, 'logout', driver, profile);
 
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
 
    await driver.quit();
}
 
const switchAccount = async(quoteId, action, driver, profile) => {
  let curr_user = '';
  // get current user
  try {
    await driver.wait(until.elementLocated(By.xpath("(//span[@class='uiImage'])[1]")), 20000).click();
    curr_user += await driver.wait(until.elementLocated(By.xpath("//h1[@class='profile-card-name']/a")), 20000).getText();
    await driver.wait(until.elementLocated(By.xpath("(//span[@class='uiImage'])[1]")), 20000).click();
  }
  catch(e) {
    console.log("Check current account failed!");
    console.log(e);
  }
  await driver.sleep(5000);

  if (action === 'login') {
    console.log('Logging in with owner account...')
    // get owner
    try {
      owner = await driver.wait(until.elementLocated(By.xpath("(//span[.='Owner']/following::force-hoverable-link/div/a)[1]/span")), 20000).getText();
    }
    catch(e) {
      console.log("Check owner failed!");
      console.log(e);
    }
    if (owner === curr_user) console.log("Already logged in!");
    else {
      // find the owner
      try {
        console.log('Finding Quote Owner...');
        await driver.wait(until.elementLocated(By.xpath("(//span[.='Owner']/following::force-hoverable-link/div/a)[1]/span")), 20000).click();
        await driver.wait(until.elementLocated(By.xpath("//div[@title='User Detail']")), 20000).click();
      }
      catch(e) {
          console.log("Finding Owner Failed: " + e);
          await driver.quit();
          process.exit(1);
      }
      await driver.sleep(5000);
      // get origin_profile and edit
      await (await driver).switchTo().defaultContent();
      const frame1 = await driver.wait(until.elementLocated(By.xpath("//*[@id='setupComponent']/div[2]/div/div/force-aloha-page/div/iframe")));
      await (await driver).switchTo().frame(frame1);
      let curr_profile = await driver.wait(until.elementLocated(By.xpath("//td[.='Profile']/following::td[1]/a")), 20000).getText();
      origin_profile += curr_profile;
      console.log("Origin profile: " + origin_profile);
      await (await driver).sleep(2000);
      await driver.wait(until.elementLocated(By.xpath("//*[@id='topButtonRow']/input[@name='edit']")), 20000).click();
      // sleep
      await (await driver).sleep(5000);
      //switch to iframe & modify profile
      await (await driver).switchTo().defaultContent();
      const frame2 = await driver.wait(until.elementLocated(By.xpath("//*[@id='setupComponent']/div[2]/div/div/force-aloha-page/div/iframe")));
      await (await driver).switchTo().frame(frame2);
      await driver.wait(until.elementLocated(By.xpath("//*[@id='Profile']")), 20000).sendKeys(profile);

      // save
      await driver.wait(until.elementLocated(By.xpath("//*[@id='topButtonRow']/input[@name='save']")), 20000).click();
      await (await driver).sleep(5000);

      // log in
      await (await driver).switchTo().defaultContent();
      const frame3 = await driver.wait(until.elementLocated(By.xpath("//*[@id='setupComponent']/div[2]/div/div/force-aloha-page/div/iframe")));
      await (await driver).switchTo().frame(frame3);
      await driver.wait(until.elementLocated(By.xpath("//*[@id='topButtonRow']/input[@name='login']")), 20000).click();
      await (await driver).sleep(5000);
      await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');
    }
  }
  else if (action === 'logout') {
    console.log('Logging out from owner account...');
    if (owner !== curr_user) console.log("Already logged out!");
    else {
      // log out
      await driver.wait(until.elementLocated(By.xpath("(//span[@class='uiImage'])[1]")), 20000).click();
      await driver.wait(until.elementLocated(By.xpath("//a[@class='profile-link-label logout uiOutputURL']")), 20000).click();
      await driver.sleep(5000);
      await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');
      // find the owner
      try {
        console.log('Finding Quote Owner...');
        await driver.wait(until.elementLocated(By.xpath("(//span[.='Owner']/following::force-hoverable-link/div/a)[1]/span")), 20000).click();
        await driver.wait(until.elementLocated(By.xpath("//div[@title='User Detail']")), 20000).click();
      }
      catch(e) {
          console.log("Finding Owner Failed: " + e);
          await driver.quit();
          process.exit(1);
      }
      // switch to iframe & eidt
      await driver.sleep(5000);
      await (await driver).switchTo().defaultContent();
      const frame1 = await driver.wait(until.elementLocated(By.xpath("//*[@id='setupComponent']/div[2]/div/div/force-aloha-page/div/iframe")));
      await (await driver).switchTo().frame(frame1);
      await driver.wait(until.elementLocated(By.xpath("//*[@id='topButtonRow']/input[@name='edit']")), 20000).click();
      // sleep
      await (await driver).sleep(5000);
      //switch to iframe & modify profile
      await (await driver).switchTo().defaultContent();
      const frame2 = await driver.wait(until.elementLocated(By.xpath("//*[@id='setupComponent']/div[2]/div/div/force-aloha-page/div/iframe")));
      await (await driver).switchTo().frame(frame2);
      console.log("Origin profile: " + origin_profile);
      await driver.wait(until.elementLocated(By.xpath("//*[@id='Profile']")), 20000).sendKeys(origin_profile);
      // save
      await driver.wait(until.elementLocated(By.xpath("//*[@id='topButtonRow']/input[@name='save']")), 20000).click();
      await (await driver).sleep(5000);
      await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');
    }
  }
  console.log(action + ' completed!');
  await (await driver).sleep(5000);
}