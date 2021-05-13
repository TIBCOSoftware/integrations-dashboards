import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();
import { switchAccount } from './switchAccount.js';

export const sales_complete = async(quoteId, operationId, driver) => {
    // log in as the operation
    await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');
    await driver.sleep(2000);
    await switchAccount(quoteId, 'login', driver, operationId);

    // scroll down
    await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');

    let approvals_sd = await driver.findElement(By.xpath("(//span[.='Approvals'])[1]"));
    await driver.executeScript("arguments[0].scrollIntoView();", approvals_sd);
    // populate the payment type
    try {
        let edit_paymentType = await driver.wait(until.elementLocated(By.xpath("(//span[.='Payment Type'])[last()]/following::button[1]/span[1]")), 15000);
        await driver.sleep(2000);
        await driver.actions().click(edit_paymentType).perform();
        await driver.sleep(2000);

        let payment_type = driver.wait(until.elementLocated(By.xpath("//label[.='Payment Type']/following::input[1]")), 15000);
        await driver.actions().click(payment_type).perform();
        await driver.sleep(2000);

        let credit_card = driver.wait(until.elementLocated(By.xpath("//lightning-base-combobox-item[.='Credit Card']")), 15000);
        await driver.actions().click(credit_card).perform();
        await driver.sleep(2000);

        let save = await driver.wait(until.elementLocated(By.xpath("//button[@name='SaveEdit']")), 15000);
        await driver.actions().click(save).perform();
        await driver.sleep(2000);
        console.log('Payment type populated!')
    }
    catch (e) {
        console.log('Population of payment type failed!');
        process.exit(1);
    }

    await driver.sleep(5000);
    await driver.navigate().refresh();

    // navigate to opp
    try {
        let navigate_to_opp = await driver.wait(until.elementLocated(By.xpath("//span[.='Opportunity']/following::a[1]")), 15000);
        await driver.actions().click(navigate_to_opp).perform();
    }
    catch(e) {
        console.log('Navigate to opp failed!' + e);
        process.exit(1);
    }

    // scroll down
    await driver.sleep(3000);
    let details = await driver.findElement(By.xpath("//div[@class='slds-grid slds-path__action runtime_sales_pathassistantPathAssistantHeader']"));
    await driver.executeScript("arguments[0].scrollIntoView();", details);
    await driver.sleep(3000);

    // set stage to sales complete
    try {
        let edit_stage = await driver.wait(until.elementLocated(By.xpath("(//span[.='Stage'])[last()]/following::button[2]/span[1]")), 15000);
        await driver.sleep(2000);
        await driver.actions().click(edit_stage).perform();
        await driver.sleep(2000);

        let stage = driver.wait(until.elementLocated(By.xpath("(//label[contains(text(), 'Stage')])[1]/following::input[1]")), 15000);
        await driver.actions().click(stage).perform();
        await driver.sleep(2000);

        let salesComplete = driver.wait(until.elementLocated(By.xpath("//lightning-base-combobox-item[@data-value='Sales Complete']")), 15000);
        await driver.actions().click(salesComplete).perform();
        await driver.sleep(2000);

        let save = await driver.wait(until.elementLocated(By.xpath("//button[@name='SaveEdit']")), 15000);
        await driver.actions().click(save).perform();
        await driver.sleep(2000);

        let cancel = await driver.wait(until.elementLocated(By.xpath("//button[@name='CancelEdit']")), 15000);
        await driver.actions().click(cancel).perform();
        await driver.sleep(2000);

        console.log('Set stage complete!');
    }
    catch(e) {
        console.log('Set stage failed!' + e);
        process.exit(1);
    }

    // scroll down
    let decommission_details = await driver.findElement(By.xpath("//span[.='Secondary Decommission Reason']"));
    await driver.executeScript("arguments[0].scrollIntoView();", decommission_details);
    await driver.sleep(2000);

    // check the finance checklist complete
    try {
        let edit_fcc = await driver.wait(until.elementLocated(By.xpath("(//span[.='Finance Checklist Complete'])[last()]/following::button[1]/span[1]")), 15000);
        await driver.sleep(2000);
        await driver.actions().click(edit_fcc).perform();
        await driver.sleep(2000);

        let finance_checkbox = driver.wait(until.elementLocated(By.xpath("//input[@name='Finance_Checklist_Complete__c']")), 15000);
        await driver.actions().click(finance_checkbox).perform();
        await driver.sleep(2000);

        let save = await driver.wait(until.elementLocated(By.xpath("//button[@name='SaveEdit']")), 15000);
        await driver.actions().click(save).perform();
    }
    catch(e) {
        console.log('Check finance checklist complete failed!' + e);
        process.exit(1);
    }

    // log out
    await driver.sleep(2000);
    await switchAccount(quoteId, 'logout', driver, operationId);
}