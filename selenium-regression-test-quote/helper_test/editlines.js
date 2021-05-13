import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();
import { switchAccount } from './switchAccount.js';

export const edit_lines = async(quoteId, ownerId, quantity, discount, license_model, driver) => {
    // Check the status of the quote
    try {
        await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 20000))
        .getText()
        .then((text) => {
            if (text === 'Draft') {
              console.log("Status checked!");
            }
            else throw new Error('Not a draft quote!');
        });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 20000)).getText();
        console.log("Status checked failed, Status - expected: Draft, value: " + text);
        process.exit(1);
    }

    // Get start date, end date Net Amount and Total ACV
    const startDate = await (await driver.wait(until.elementLocated(By.xpath("//div/span[.='Start Date']/following::lightning-formatted-text")), 20000)).getText();
    const endDate = await (await driver.wait(until.elementLocated(By.xpath("//div/span[.='End Date']/following::lightning-formatted-text")), 20000)).getText();
    const net_amount = await (await driver.wait(until.elementLocated(By.xpath("//p[.='Net Amount']/following::lightning-formatted-text[1]")), 20000)).getText();
    const total_ACV = await (await driver.wait(until.elementLocated(By.xpath("//p[.='Total ACV']/following::lightning-formatted-text[1]")), 20000)).getText();
    console.log("start date: " + startDate);
    console.log("end date: " + endDate);
    console.log("Net Amount: " + net_amount);
    console.log("Total ACV: " + total_ACV);

    // modify and login with the owner account
    await switchAccount(quoteId, 'login', driver, ownerId);

    // Eidt lines
    await driver.sleep(2000);
    try {
        await driver.wait(until.elementLocated(By.xpath("//runtime_platform_actions-action-renderer[@apiname='Edit_Lines']")), 20000)
            .click()
            .then(() => {
                console.log("QLE loading...");
            })
    }
    catch (e) {
        console.log(e);
        process.exit(1);
    }

    // Switch iframe
    const frame = await driver.wait(until.elementLocated(By.xpath("//iframe")),20000);
    await (await driver).switchTo().frame(frame);

    // Check add product button
    try {
        await driver.wait(until.elementLocated(By.xpath("//div[@id='buttons']/div[@id='actions']/sb-custom-action[@name='Add Products']/paper-button")), 30000);
    }
    catch (e) {
        console.log(e);
        process.exit(1);
    }

    // Validate start date and end date
    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@tooltip='Start Date']/following::input[@id='selectedDate'])[1]")), 20000))
            .getAttribute('value')
            .then((text) => {
                const sdate = new Date(text);
                sdate.setDate(sdate.getDate() + 1);
                if (sdate.toLocaleDateString("en-US") === startDate) {
                    console.log("Start Date checked!");
                }
                else throw new Error('Start Date does not match!');
            });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@tooltip='Start Date']/following::input[@id='selectedDate'])[1]")), 20000)).getAttribute('value');
        console.log("Start Date checked failed, Start Date - expected: " + startDate + ", value: " + text);
        process.exit(1);
    }

    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@tooltip='End Date']/following::input[@id='selectedDate'])[1]")), 20000))
        .getAttribute('value')
        .then((text) => {
            const edate = new Date(text);
            edate.setDate(edate.getDate() + 1);
            if (edate.toLocaleDateString("en-US") === endDate) {
              console.log("End Date checked!");
            }
            else throw new Error('End Date does not match!');
        });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@tooltip='End Date']/following::input[@id='selectedDate'])[1]")), 20000)).getAttribute('value');
        console.log("End Date checked failed, End Date - expected: " + endDate + ", value: " + text);
        process.exit(1);
    }

    // Click add product button
    await driver.wait(until.elementLocated(By.xpath("//sb-custom-action[@name='Add Products']/paper-button")), 15000)
        .click()
        .then(() => {
            console.log("Loading products...");
        })
    
    // Check select button
    try {
        await driver.wait(until.elementLocated(By.xpath("//paper-button[@id='plSelect']")), 30000);
    }
    catch (e) {
        console.log(e);
        process.exit(1);
    }

    // Pick up the first product with License Model "Subscription"
    try {
        await driver.wait(until.elementLocated(By.xpath("(//sb-table-cell[@item='Product2.License_Model__c']/div/sb-field/span/div/span[.='" + license_model + "'])[1]/preceding::div[@id='checkboxContainer'][1]")), 30000).click();
    }
    catch (e) {
        console.log("No product with License Model " + "\"" +license_model + "\"" + "!");
        console.log(e);
        process.exit(1);
    }

    // Get price and name
    const price = await (await driver.wait(until.elementLocated(By.xpath("(//sb-table-cell[@item='Product2.License_Model__c']/div/sb-field//span/div/span[.='" + license_model + "'])[1]/following::sb-table-cell[@item='UnitPrice'][1]")), 20000)).getText();
    const name = await (await driver.wait(until.elementLocated(By.xpath("(//sb-table-cell[@item='Product2.License_Model__c']/div/sb-field//span/div/span[.='" + license_model + "'])[1]/preceding::span[@id='me'][1]")), 20000)).getText();
    console.log("Price: " + price);
    console.log("Name: " + name);

    // Click "Select"
    await (await driver.wait(until.elementLocated(By.xpath("//paper-button[@id='plSelect']")),20000)).click();

    // Check save button
    try {
        await driver.wait(until.elementLocated(By.xpath("//sb-custom-action/paper-button[text()='Save']")), 15000)
    }
    catch (e) {
        console.log(e);
        process.exit(1);
    }

    // index (Perpetual License)
    let index = 'last()';
    if (license_model === 'Perpetual License') index = 'last()-1';

    // Validate name
    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='SBQQ__ProductName__c'])[" + index + "]/div/span[last()]")), 20000))
            .getText()
            .then((text) => {
                const v1 = text.split(' - ');
                const v2 = v1[0].replace('™', '');
                const v3 = name.replace('™', '');
                const v4 = name.replace('™', ' ');
                if (v2 === v3 || v2 === v4) {
                    console.log("Product Name checked!");
                }
                else throw new Error('Product Name does not match!');
            });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='SBQQ__ProductName__c'])[" + index + "]/div/span[last()]")), 20000)).getText();
        console.log("Product Name checked failed, Product Name - expected: " + name + ", value: " + text);
        process.exit(1);
    }

    // Get net tatal
    const net_total = await (await driver.wait(until.elementLocated(By.xpath("(//div[@index='8'])[" + index + "]/div")), 20000)).getText();
    // Validate unit price
    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Base_Unit_Price__c'])[" + index + "]/div")), 20000))
            .getText()
            .then((text) => {
                if (text === price) {
                    console.log("Product Price checked!");
                }
                else throw new Error('Product Price does not match!');
            });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Uplifted_Customer_Base_Total__c'])[" + index + "]/div")), 20000)).getText();
        console.log("Product Price checked failed before calculation, Product Price - expected: " + price + ", value: " + text);
        process.exit(1);
    }

    // Input the quantity
    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Custom_Quantity__c'])[" + index + "]")), 20000)).click();
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Custom_Quantity__c'])[" + index + "]")), 20000)).click();
        await driver.wait(until.elementLocated(By.xpath("(//div[@field='Custom_Quantity__c'])[" + index + "]/div/div/sb-input/input")), 20000)
            .sendKeys(quantity)
            .then(console.log("Input the quantity: " + quantity));
    }
    catch(e) {
        console.log("Update quantity failed!");
        console.log(e);
        process.exit(1);
    }

    // Input the discount
    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='SBQQ__AdditionalDiscount__c'])[" + index + "]")), 20000)).click();
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='SBQQ__AdditionalDiscount__c'])[" + index + "]")), 20000)).click();
        await driver.wait(until.elementLocated(By.xpath("(//div[@field='SBQQ__AdditionalDiscount__c'])[" + index + "]/div/div/sb-discount/sb-input/input")), 20000)
            .sendKeys(discount)
            .then(console.log("Input the discount: " + discount));
    }
    catch(e) {
        console.log("Update discount failed!");
        console.log(e);
        process.exit(1);
    }

    // Find the first renewed line & Change the quantity to 0
    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Line_Status__c']/div[.='Renewed'])[1]/following::div[@field='Custom_Quantity__c'][1]")), 20000)).click();
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Line_Status__c']/div[.='Renewed'])[1]/following::div[@field='Custom_Quantity__c'][1]")), 20000)).click();
        await driver.wait(until.elementLocated(By.xpath("(//div[@field='Line_Status__c']/div[.='Renewed'])[1]/following::div[@field='Custom_Quantity__c'][1]/div/div/sb-input/input")), 20000)
            .sendKeys('0')
            .then(console.log("The first renewed line cancelled!"));
    }
    catch(e) {
        console.log("Cancellation failed!");
        console.log(e);
        process.exit(1);
    }

    // Click calculate
    await driver.wait(until.elementLocated(By.xpath("//sb-custom-action/paper-button[text()='Calculate']")), 15000)
        .click()
        .then(console.log("Calculating..."));

    // Validate net total after the calculation
    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@index='8'])[" + index + "]/div")), 20000))
            .getText()
            .then((text) => {
                const nums_before = net_total.split(" ")[1].split(",");
                const nums_after = text.split(" ")[1].split(",");
                let net_total_before = '';
                let net_total_after = '';
                nums_before.forEach(num => net_total_before += num)
                nums_after.forEach(num => net_total_after += num)
                let total1 = (((100-discount)/100 * net_total_before) * quantity).toFixed(2);
                let total2 = parseFloat(net_total_after).toFixed(2);
                console.log(total1);
                console.log(total2);
                if (Math.abs(total1 - total2) < 1) {
                    console.log("Net total checked after calculation!");
                    console.log("Net total - Before: USD " + net_total_before);
                    console.log("Net total - After: USD " + net_total_after);
                }
                else throw new Error('Net total does not match!');
            });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@index='8'])[" + index + "]/div")), 20000)).getText();
        const nums_before = net_total.split(" ")[1].split(",");
        const nums_after = text.split(" ")[1].split(",");
        let net_total_before = '';
        let net_total_after = '';
        nums_before.forEach(num => net_total_before += num)
        nums_after.forEach(num => net_total_after += num)
        let total1 = (((100-discount)/100 * net_total_before).toFixed(2) * quantity).toFixed(2);
        let total2 = parseFloat(net_total_after).toFixed(2);
        console.log("Net total check failed after calculation, Net Total - expected: USD " + total1 + ", value: USD " + total2);
        process.exit(1);
    }

    // Validate Maintenance if license model is perpetual liscense !!!
    if (license_model === 'Perpetual License') {

    }

    // Validate the red flag
    try {
        const src = await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Approval_Flag__c'])[last()]/div/div/img")), 20000)).getAttribute("src");
        if (src.includes('comfirm')) console.log("Green Flag!");
        if (src.includes('error')) console.log("Red Flag!");
    }
    catch(e) {
        console.log('Red Flad Failed!' + e);
        process.exit(1);
    }

    // Click save
    await driver.wait(until.elementLocated(By.xpath("//sb-custom-action/paper-button[text()='Save']")), 15000)
        .click()
        .then(console.log("Saving..."));

    // Wait for data update
    await (await driver).sleep(5000);
}