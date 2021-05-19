import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import { quotesTest } from '../quote_action_test/test.js';
import { amount, checkout } from '../helper_test/checkout.js';
import { switchAccount } from '../helper_test/switchAccount.js';
import 'chromedriver';
import dotenv from 'dotenv';
import { edit_lines } from '../helper_test/editlines.js';
import { sales_complete } from '../helper_test/salescomplete.js';
dotenv.config();
 
// Outline - quotelineTest
  // take quoteId, profile, quantity, discount,license_model and driver as parameters
  // check values in the quote page
  // login owner account (change profile)
  // edit lines
    // add product
    // change quantity and discount
    // cancel product
  // check values --- !!!
  // submit for approval
  // log out owner (change profile)
  // check values
  // login approver
  // approve action
  // logout approver
  // login owner
  // check values
 
  // shopify
export const quotelineTest = async(quoteId, ownerId, approverId, operationId, quantity, discount, license_model, driver) => {
 
    // all parameters
    console.log('Quote ID: ' + quoteId);
    console.log('Owner ID: ' + ownerId);
    console.log('Approver ID: ' + approverId);
    console.log('Operation ID: ' + operationId);
    console.log('Quanity: ' + quantity);
    console.log('Discount: ' + discount);
    console.log('License Model: ' + license_model);
 
 
    // Get quote by url (id)
    await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');
 
    // edit lines
    await edit_lines(quoteId, ownerId, quantity, discount, license_model, driver);
 
    // submit for approval
    await quotesTest(quoteId, 'submit', ownerId, driver);
 
    // approve this quote
    let isApprovalRequired = await driver.wait(until.elementLocated(By.xpath("//label[.='Approval Required']/span[1]")), 10000);
    if (isApprovalRequired.isSelected()) {
        await approveQuote(quoteId, approverId, driver);
    }

    // // get the net amount
    // try {
    //     const net_amount_before = await (await driver.wait(until.elementLocated(By.xpath("//p[.='Net Amount']/following::lightning-formatted-text[1]")), 20000)).getText();
    //     console.log("Net Amount before checkout: " + net_amount_before);
    // }
    // catch (e) {
    //     console.log('Can not find Net Amount before checkout!');
    // }
 
    // checkout
    await checkout(quoteId, driver, amount);

    // sleep
    console.log('Sleep for 30 secs...');
    await driver.sleep(30000);
    await driver.navigate().refresh();

    // // get the net amount
    // try {
    //     const net_amount_after = await (await driver.wait(until.elementLocated(By.xpath("//p[.='Net Amount']/following::lightning-formatted-text[1]")), 20000)).getText();
    //     let amount2 = net_amount_after.split(" ")[1];
    //     console.log("Net Amount after checkout: " + amount2);
    //     console.log(amount);
    //     if (amount === amount2) {
    //         console.log('Net Amount checked!')
    //     }
    //     else throw new Error('Net Amont not checked!');
    // }
    // catch (e) {
    //     console.log(e);
    // }

    // check the new product
    await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/' + quoteId +'/related/SBQQ__LineItems__r/view');
    console.log("Opening Quote Lines...");
 
    try{
        await driver.wait(until.elementLocated(By.xpath("(//table/tbody/tr)[last()]/td[3]/span/span")), 15000)
            .getText()
            .then(text => {
                if (text === 'TIBCO Statistica Server (ProdPlus) - Processor - Bronze') {
                    console.log('New product added!');
                    console.log('New product: ' + text);
                }
                else throw new Error('Product Price does not match!');
            });
    }
    catch(e) {
        const text = await driver.wait(until.elementLocated(By.xpath("(//table/tbody/tr)[last()]/td[3]/span/span")), 15000).getText();
        console.log('Adding new product failed, last product - expected: TIBCO Statistica Server (ProdPlus) - Processor - Bronze, value: ' + text);
    }
 
    // change opp fields
    // await sales_complete(quoteId, operationId, driver);
    
    // driver.quit();
}
 
 
const checkEachLine = async(quoteId) => {
    await driver.get("https://tibcocpq--sandbox.lightning.force.com/lightning/r/" + quoteId + "/related/SBQQ__LineItems__r/view")
 
}
 
const approveQuote = async(quoteId, approverId, driver) => {
    // login approver
    // await switchAccount(quoteId, 'login', driver, approverId);
 
    // scroll down
    let Element = await driver.findElement(By.xpath("//span[.='Address Information']"));
    await driver.executeScript("arguments[0].scrollIntoView();", Element);
    await driver.sleep(5000);
 
    // Approve this quote
    try {
        let approvals = await driver.wait(until.elementLocated(By.xpath("//span[@title='Approvals']")), 20000);
        await (await driver).sleep(2000);
        await driver.actions().click(approvals).perform();
        console.log('Approvals clicked!')
        await (await driver).sleep(2000);
        let curr_url = await driver.getCurrentUrl().then(url => {
            return url;
        })
        console.log('Current URL: ' + curr_url);
        let approve = await driver.wait(until.elementLocated(By.xpath("(//tr/td[5][.='Requested'])[1]/preceding::th[1]/span/span/a[1]")), 20000);
        await (await driver).sleep(2000);
        await driver.actions().click(approve).perform();
        await (await driver).sleep(2000);
        await (await driver).switchTo().defaultContent();
        const frame_approve = await driver.wait(until.elementLocated(By.xpath("//iframe")));
        await (await driver).switchTo().frame(frame_approve);
        let final_approve = await driver.wait(until.elementLocated(By.xpath("//input[@value='Approve']")), 20000);
        await (await driver).sleep(2000);
        await driver.actions().click(final_approve).perform();
        console.log('Quote approved!')
    }
    catch (e) {
        console.log('Approve quote failed!' + e);
        process.exit(1);
    }
    await (await driver).sleep(5000);
 
    // log out approver
    await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');
    await driver.sleep(2000);
    await switchAccount(quoteId, 'logout', driver, approverId);
}
 
// checkout
// node test_run a0p1I0000095NRXQA2 0051I000000dzesQAA 0051I000001yEr7QAE 0051I000006NbUOQA0 2 30 Subscription
// node test_run a0p2g000001ZJCZAA4 0051I000006NbUJQA0 0051I000001yEr7QAE 0051I000006NbUOQA0 2 30 Subscription