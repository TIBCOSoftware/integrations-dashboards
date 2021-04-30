import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import { quotesTest, switchAccount } from '../quote_action_test/test.js';
import { checkout } from '../helper_test/checkout';
import 'chromedriver';
import dotenv from 'dotenv';
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
export const quotelineTest = async(quoteId, ownerId, approverId, quantity, discount, license_model, driver) => {

    // all parameters
    console.log('Quote ID: ' + quoteId);
    console.log('Owner ID: ' + ownerId);
    console.log('Approver ID: ' + approverId);
    console.log('Quanity: ' + quantity);
    console.log('Discount: ' + discount);
    console.log('License Model: ' + license_model);

    // Get quote by url (id)
    await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');

    // // Check the status of the quote
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
        driver.quit();
    }

    // Get start date, end date Net Amount and Total ACV
    const startDate = await (await driver.wait(until.elementLocated(By.xpath("//div/span[.='Start Date']/following::lightning-formatted-text")), 20000)).getText();
    const endDate = await (await driver.wait(until.elementLocated(By.xpath("//div/span[.='End Date']/following::lightning-formatted-text")), 20000)).getText();
    const net_amount = await (await driver.wait(until.elementLocated(By.xpath("//*[@id='brandBand_2']/div/div/div[1]/div/one-record-home-flexipage2/forcegenerated-adgrollup_component___forcegenerated__flexipage_recordpage___quote_record_page___sbqq__quote__c___view/forcegenerated-flexipage_quote_record_page_sbqq__quote__c__view_js/record_flexipage-record-page-decorator/div[1]/slot/flexipage-record-home-template-desktop2/div/div[1]/slot/slot/flexipage-component2/slot/records-lwc-highlights-panel/records-lwc-record-layout/forcegenerated-highlightspanel_sbqq__quote__c___0121i000000p2ctqaq___compact___view___recordlayout2/force-highlights2/div[1]/div[2]/slot/slot/force-highlights-details-item[2]/div/p[2]/slot/records-formula-output/slot/lightning-formatted-text")), 20000)).getText();
    const total_ACV = await (await driver.wait(until.elementLocated(By.xpath("//*[@id='brandBand_2']/div/div/div[1]/div/one-record-home-flexipage2/forcegenerated-adgrollup_component___forcegenerated__flexipage_recordpage___quote_record_page___sbqq__quote__c___view/forcegenerated-flexipage_quote_record_page_sbqq__quote__c__view_js/record_flexipage-record-page-decorator/div[1]/slot/flexipage-record-home-template-desktop2/div/div[1]/slot/slot/flexipage-component2/slot/records-lwc-highlights-panel/records-lwc-record-layout/forcegenerated-highlightspanel_sbqq__quote__c___0121i000000p2ctqaq___compact___view___recordlayout2/force-highlights2/div[1]/div[2]/slot/slot/force-highlights-details-item[3]/div/p[2]/slot/records-formula-output/slot/lightning-formatted-text")), 20000)).getText();
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
        driver.quit();
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
        driver.quit();
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
        driver.quit();
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
        driver.quit();
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
        driver.quit();
    }

    // Pick up the first product with License Model "Subscription"
    try {
        await driver.wait(until.elementLocated(By.xpath("(//sb-table-cell[@item='Product2.License_Model__c']/div/sb-field/span/div/span[.='" + license_model + "'])[1]/preceding::div[@id='checkboxContainer'][1]")), 30000).click();
    }
    catch (e) {
        console.log("No product with License Model " + "\"" +license_model + "\"" + "!");
        console.log(e);
        driver.quit();
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
        driver.quit();
    }

    // index (Perpetual License)
    let index = 'last()';
    if (license_model === 'Perpetual License') index = 'last()-1';
    // Get net tatal
    const net_total = await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Net_Total_Bundle__c'])[" + index + "]/div")), 20000)).getText();

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
        driver.quit();
    }

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
        driver.quit();
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
        // driver.quit();
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
        // driver.quit();
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
        // driver.quit();
    }

    // Click calculate
    await driver.wait(until.elementLocated(By.xpath("//sb-custom-action/paper-button[text()='Calculate']")), 15000)
        .click()
        .then(console.log("Calculating..."));

    // Validate net total after the calculation
    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Net_Total_Bundle__c'])[" + index + "]/div")), 20000))
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
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Net_Total_Bundle__c'])[" + index + "]/div")), 20000)).getText();
        const nums_before = net_total.split(" ")[1].split(",");
        const nums_after = text.split(" ")[1].split(",");
        let net_total_before = '';
        let net_total_after = '';
        nums_before.forEach(num => net_total_before += num)
        nums_after.forEach(num => net_total_after += num)
        let total1 = (((100-discount)/100 * net_total_before).toFixed(2) * quantity).toFixed(2);
        let total2 = parseFloat(net_total_after).toFixed(2);
        console.log("Net total check failed after calculation, Net Total - expected: USD " + total1 + ", value: USD " + total2);
        driver.quit();
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
        console.log(e);
    }

    // Click save
    await driver.wait(until.elementLocated(By.xpath("//sb-custom-action/paper-button[text()='Save']")), 15000)
        .click()
        .then(console.log("Saving..."));

    // Continue if alert
    // try {
    //     await (await driver.wait(until.elementLocated(By.xpath("//paper-button[@id='continue']")), 15000)).click()
    // }
    // catch(e) {
    // }

    // Wait for data update
    await (await driver).sleep(5000);

    {// --- !!!
    // Validate Net Amount and Total ACV
    // try {
    //     await (await driver.wait(until.elementLocated(By.xpath("//*[@id='brandBand_2']/div/div/div[1]/div/one-record-home-flexipage2/forcegenerated-adgrollup_component___forcegenerated__flexipage_recordpage___quote_record_page___sbqq__quote__c___view/forcegenerated-flexipage_quote_record_page_sbqq__quote__c__view_js/record_flexipage-record-page-decorator/div[1]/slot/flexipage-record-home-template-desktop2/div/div[1]/slot/slot/flexipage-component2/slot/records-lwc-highlights-panel/records-lwc-record-layout/forcegenerated-highlightspanel_sbqq__quote__c___0121i000000p2ctqaq___compact___view___recordlayout2/force-highlights2/div[1]/div[2]/slot/slot/force-highlights-details-item[2]/div/p[2]/slot/records-formula-output/slot/lightning-formatted-text")), 20000))
    //         .getText()
    //         .then(text => {
    //             const net_amount_num = net_amount.split(" ")[1].split(",");
    //             const total_ACV_num = total_ACV.split(" ")[1].split(",");
    //             let net_amount_before = '';
    //             let total_ACV_before = '';
    //             net_amount_num.forEach(num => net_amount_before += num);
    //             total_ACV_num.forEach(num => total_ACV_before += num);
    //         });
    //     const total_ACV = await (await driver.wait(until.elementLocated(By.xpath("//*[@id='brandBand_2']/div/div/div[1]/div/one-record-home-flexipage2/forcegenerated-adgrollup_component___forcegenerated__flexipage_recordpage___quote_record_page___sbqq__quote__c___view/forcegenerated-flexipage_quote_record_page_sbqq__quote__c__view_js/record_flexipage-record-page-decorator/div[1]/slot/flexipage-record-home-template-desktop2/div/div[1]/slot/slot/flexipage-component2/slot/records-lwc-highlights-panel/records-lwc-record-layout/forcegenerated-highlightspanel_sbqq__quote__c___0121i000000p2ctqaq___compact___view___recordlayout2/force-highlights2/div[1]/div[2]/slot/slot/force-highlights-details-item[3]/div/p[2]/slot/records-formula-output/slot/lightning-formatted-text")), 20000)).getText();
    
    //     await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Net_Total_Bundle__c'])[" + index + "]/div")), 20000))
    //         .getText()
    //         .then((text) => {
    //             const nums_before = net_total.split(" ")[1].split(",");
    //             const nums_after = text.split(" ")[1].split(",");
    //             let net_total_before = '';
    //             let net_total_after = '';
    //             nums_before.forEach(num => net_total_before += num)
    //             nums_after.forEach(num => net_total_after += num)
    //             let total1 = (((100-discount)/100 * net_total_before) * quantity).toFixed(2);
    //             let total2 = parseFloat(net_total_after).toFixed(2);
    //             console.log(total1);
    //             console.log(total2);
    //             if (Math.abs(total1 - total2) < 1) {
    //                 console.log("Net total checked after calculation!");
    //                 console.log("Net total - Before: USD " + net_total_before);
    //                 console.log("Net total - After: USD " + net_total_after);
    //             }
    //             else throw new Error('Net total does not match!');
    //         });
    // }
    // catch(e) {
    //     const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Net_Total_Bundle__c'])[" + index + "]/div")), 20000)).getText();
    //     const nums_before = net_total.split(" ")[1].split(",");
    //     const nums_after = text.split(" ")[1].split(",");
    //     let net_total_before = '';
    //     let net_total_after = '';
    //     nums_before.forEach(num => net_total_before += num)
    //     nums_after.forEach(num => net_total_after += num)
    //     let total1 = (((100-discount)/100 * net_total_before).toFixed(2) * quantity).toFixed(2);
    //     let total2 = parseFloat(net_total_after).toFixed(2);
    //     console.log("Net total check failed after calculation, Net Total - expected: USD " + total1 + ", value: USD " + total2);
    //     driver.quit();
    // }
    }

    // submit for approval
    await quotesTest(quoteId, 'submit', ownerId, driver);

    // login approver
    await switchAccount(quoteId, 'login', driver, approverId);

    // scroll down
    let Element = await driver.findElement(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text"));
    await driver.executeScript("arguments[0].scrollIntoView();", Element);
    await driver.sleep(5000);

    // Approve this quote
    try {
        let approvals = await driver.wait(until.elementLocated(By.xpath("//span[@title='Approvals']")), 20000);
        await (await driver).sleep(2000);
        await driver.actions().click(approvals).perform();
        await (await driver).sleep(2000);
        let approve = await driver.wait(until.elementLocated(By.xpath("(//tr/td[5][.='Requested'])[1]/preceding::th[1]/span/span/a[1]")), 20000);
        await (await driver).sleep(2000);
        await driver.actions().click(approve).perform();
        await (await driver).sleep(2000);
        // await (await driver.wait(until.elementLocated(By.xpath("//lightning-button/button[.='Approve']")), 20000)).click();
        // await (await driver).sleep(2000);
        // await (await driver.wait(until.elementLocated(By.xpath("//textarea")), 20000)).sendKeys("Approved");
        // await (await driver).sleep(2000);
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

    // checkout shopify url
    await checkout(quoteId, driver);

    // // log in owner
    // await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');
    // await driver.sleep(2000);
    // await switchAccount(quoteId, 'login', driver, ownerId);


    // scroll down
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
    }

    // 
    await driver.navigate().refresh();

    // navigate to opp
    try {
        let navigate_to_opp = await driver.wait(until.elementLocated(By.xpath("//span[.='Opportunity']/following::a[1]")), 15000);
        await driver.actions().click(navigate_to_opp).perform();
    }
    catch(e) {
        console.log('Navigate to opp failed!' + e);
    }

    // scroll down
    let details = await driver.findElement(By.xpath("//a[.='Details']"));
    await driver.executeScript("arguments[0].scrollIntoView();", details);
    await driver.sleep(2000);

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
    }

    // log in as operations

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
    }




    // // Validate Quote Lines (Line Status & Product Name)
    // await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/' + quoteId +'/related/SBQQ__LineItems__r/view')
    //     .then(console.log("Opening Quote Lines"));

    // try {
    //     await (await driver).sleep(5000);
    //     await (await driver.wait(until.elementLocated(By.xpath("(//tr)[last()-1]/td[2]/span/span")), 20000))
    //         .getText()
    //         .then((text) => {
    //             if (text === 'New') {
    //                 console.log("Line Status checked!");
    //             }
    //             else throw new Error('Line Status does not match!');
    //         });
    // }
    // catch(e) {
    //     const text = await (await driver.wait(until.elementLocated(By.xpath("(//tr)[last()-1]/td[2]/span/span")), 20000)).getText();
    //     console.log("Line Status check failed, Line Status - expected: " + "New" + ", value: " + text);
    //     driver.quit();
    // }

    // try {
    //     await (await driver.wait(until.elementLocated(By.xpath("(//tr)[last()-1]/td[3]/span/span")), 20000))
    //     .getText()
    //     .then((text) => {
    //         const v1 = text.split(' - ');
    //         const v2 = v1[0].replace('™', '');
    //         const v3 = name.replace('™', '');
    //         const v4 = name.replace('™', ' ');
    //         if (v2 === v3 || v2 === v4) {
    //           console.log("Product Name checked!");
    //         }
    //         else throw new Error('Product Name does not match!');
    //     });
    // }
    // catch(e) {
    //     const text = await (await driver.wait(until.elementLocated(By.xpath("(//tr)[last()-1]/td[3]/span/span")), 20000)).getText();
    //     console.log("Product Name check failed, Product Name - expected: " + name + ", value: " + text);
    //     driver.quit();
    // }
    // console.log('Product is added to Quote Lines!');

    // each quote lines - three values!!!
    // await checkEachLine();


    

    

    // // check more values
    //     // quote page - Marketplace Integration Stage, Marketplace Integration - Last Updated, Shopify URL
        
    //     try {
    //         await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Marketplace Integration Stage']/following::lightning-formatted-text")), 10000))
    //         .getText()
    //         .then((text) => {
    //             if (text === 'In Progress') {
    //               console.log("!");
    //             }
    //             else throw new Error('Status not checked bofore submission!');
    //         });
    //       }
    //       catch(e) {
    //         const text = await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000)).getText();
    //         console.log("Status checked failed, Status - expected: Draft or empty, value: " + text);
    //         await driver.quit();
    //         process.exit(1);
    //       }

    

    // check status and recordType
    // try {
    //     await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000))
    //       .getText()
    //       .then((text) => {
    //           if (text === 'Approved') {
    //               console.log("Status checked - Approved!");
    //           }
    //           else throw new Error('Status not approved!');
    //     });
    // }
    // catch(e) {
    //       const text = await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000)).getText();
    //       console.log("Status checked failed, Status - expected: Approved, value: " + text);
    //       await driver.quit();
    //       process.exit(1);
    // }
      
    // try {
    //     await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000)
    //       .getText()
    //       .then(text => {
    //           if (text === 'Approved Quote') {
    //           console.log("Record Type - Approved!");
    //           }
    //           else throw new Error('Record Type not approved!');
    //       });
    // }
    // catch (e) {
    //       const text = await driver.wait(until.elementLocated(By.xpath("//span[@force-recordtype_recordtype='']")), 10000).getText();
    //       console.log("RecordType checked failed, RecordType - expected: Approved Quote, value: " + text);
    //       await driver.quit();
    //       process.exit(1);
    // }

    // each quote lines - three values!!!
    // await checkEachLine();



    // driver.quit();
}


const checkEachLine = async(quoteId) => {
    await driver.get("https://tibcocpq--sandbox.lightning.force.com/lightning/r/" + quoteId + "/related/SBQQ__LineItems__r/view")

}