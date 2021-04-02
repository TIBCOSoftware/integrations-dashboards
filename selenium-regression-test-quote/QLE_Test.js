const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
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

QLE_Test = async(quoteId) => {

    // Open the sandbox
    let driver = new Builder()
        .forBrowser('chrome').build();

    await driver.get('https://tibcocpq--sandbox.lightning.force.com/lightning/page/home');

    // Log in with email and password
    await driver.findElement(By.css('#email')).sendKeys(account);
    await driver.findElement(By.css('#next')).click();
    await driver.wait(until.elementLocated(By.css('#password'))).sendKeys(password);
    await driver.wait(until.elementLocated(By.css('#taLogin'))).click();

    // Get quote by url (id)
    await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');

    // Check the status of the quote
    try {
        await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000))
        .getText()
        .then((text) => {
            if (text === 'Draft') {
              console.log("Status checked!");
            }
            else throw new Error('Not a draft quote!');
        });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("//div/span[. = 'Status']/following::lightning-formatted-text")), 10000)).getText();
        console.log("Status checked failed, Status - expected: Draft, value: " + text);
        driver.quit();
    }

    // Get start date and end date
    const startDate = await (await driver.wait(until.elementLocated(By.xpath("//div/span[.='Start Date']/following::lightning-formatted-text")), 10000)).getText();
    const endDate = await (await driver.wait(until.elementLocated(By.xpath("//div/span[.='End Date']/following::lightning-formatted-text")), 10000)).getText();
    console.log("start date: " + startDate);
    console.log("end date: " + endDate);

    // Eidt lines
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
    // await driver.wait(until.ableToSwitchToFrame(By.xpath("//iframe")), 20000);
    const frame = await driver.wait(until.elementLocated(By.xpath("//iframe")));
    await (await driver).switchTo().frame(frame);

    // Check add product button
    try {
        await driver.wait(until.elementLocated(By.xpath("//div[@id='buttons']/div[@id='actions']/sb-custom-action[@name='Add Products']/paper-button")), 20000);
    }
    catch (e) {
        console.log(e);
        driver.quit();
    }

    // Validate start date and end date
    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@tooltip='Start Date']/following::input[@id='selectedDate'])[1]")), 10000))
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
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@tooltip='Start Date']/following::input[@id='selectedDate'])[1]")), 10000)).getAttribute('value');
        console.log("Start Date checked failed, Start Date - expected: " + startDate + ", value: " + text);
        driver.quit();
    }

    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@tooltip='End Date']/following::input[@id='selectedDate'])[1]")), 10000))
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
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@tooltip='End Date']/following::input[@id='selectedDate'])[1]")), 10000)).getAttribute('value');
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
        await driver.wait(until.elementLocated(By.xpath("//paper-button[@id='plSelect']")), 20000);
    }
    catch (e) {
        console.log(e);
        driver.quit();
    }

    // Pick up the first product with License Model "Subscription"
    try {
        await driver.wait(until.elementLocated(By.xpath("(//sb-table-cell[@item='Product2.License_Model__c']/div/sb-field/span/div/span[.='Subscription'])[1]/preceding::div[@id='checkboxContainer'][1]")), 10000).click();
    }
    catch (e) {
        console.log("No product with License Model \"Subscription\"!");
        console.log(e);
        driver.quit();
    }

    // Get price and name
    const price = await (await driver.wait(until.elementLocated(By.xpath("(//sb-table-cell[@item='Product2.License_Model__c']/div/sb-field//span/div/span[.='Subscription'])[1]/following::sb-table-cell[@item='UnitPrice'][1]")), 10000)).getText();
    const name = await (await driver.wait(until.elementLocated(By.xpath("(//sb-table-cell[@item='Product2.License_Model__c']/div/sb-field//span/div/span[.='Subscription'])[1]/preceding::span[@id='me'][1]")), 10000)).getText();
    console.log("Price: " + price);
    console.log("Name: " + name);

    // Click "Select"
    await (await driver.wait(until.elementLocated(By.xpath("//paper-button[@id='plSelect']")),10000)).click();

    // Check save button
    try {
        await driver.wait(until.elementLocated(By.xpath("//sb-custom-action/paper-button[text()='Save']")), 15000)
    }
    catch (e) {
        console.log(e);
        driver.quit();
    }

    // Validate name, price and quantity
    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='SBQQ__ProductName__c'])[last()]/div/span[last()]")), 20000))
            .getText()
            .then((text) => {
                const v1 = text.split(' - ');
                const v2 = v1[0].replace('™', '');
                const v3 = name.replace('™', '');
                if (v2 === v3) {
                    console.log("Product Name checked!");
                }
                else throw new Error('Product Name does not match!');
            });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='SBQQ__ProductName__c'])[last()]/div/span[last()]")), 20000)).getText();
        console.log("Product Name checked failed, Product Name - expected: " + name + ", value: " + text);
        driver.quit();
    }

    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Custom_Quantity__c'])[last()]/div")), 20000))
            .getText()
            .then((text) => {
                if (text === '1.00') {
                    console.log("Product Quantity checked!");
                }
                else throw new Error('Product Quantity does not match!');
            });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Custom_Quantity__c'])[last()]/div")), 10000)).getText();
        console.log("Product Quantity checked failed, Product Quantity - expected: " + "1.00" + ", value: " + text);
        driver.quit();
    }

    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Base_Unit_Price__c'])[last()]/div")), 10000))
            .getText()
            .then((text) => {
                if (text === price) {
                    console.log("Product Price checked!");
                }
                else throw new Error('Product Price does not match!');
            });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//div[@field='Uplifted_Customer_Base_Total__c'])[last()]/div")), 10000)).getText();
        console.log("Product Price checked failed, Product Price - expected: " + price + ", value: " + text);
        driver.quit();
    }

    // Click save
    await driver.wait(until.elementLocated(By.xpath("//sb-custom-action/paper-button[text()='Save']")), 15000)
        .click()
        .then(console.log("Saving..."));

    // Wait for data update
    await (await driver).sleep(10000);

    // Validate Quote Lines (Line Status & Product Name)
    await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/' + quoteId +'/related/SBQQ__LineItems__r/view')
        .then(console.log("Opening Quote Lines"));

    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//tr)[last()-1]/td[2]/span/span")), 10000))
            .getText()
            .then((text) => {
                if (text === 'New') {
                    console.log("Line Status checked!");
                }
                else throw new Error('Line Status does not match!');
            });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//tr)[last()-1]/td[2]/span/span")), 10000)).getText();
        console.log("Line Status checked failed, Line Status - expected: " + "New" + ", value: " + text);
        driver.quit();
    }

    try {
        await (await driver.wait(until.elementLocated(By.xpath("(//tr)[last()-1]/td[3]/span/span")), 10000))
        .getText()
        .then((text) => {
            const v1 = text.split(' - ');
            const v2 = v1[0].replace('™', '');
            const v3 = name.replace('™', '');
            if (v2 === v3) {
              console.log("Product Name checked!");
            }
            else throw new Error('Product Name does not match!');
        });
    }
    catch(e) {
        const text = await (await driver.wait(until.elementLocated(By.xpath("(//tr)[last()-1]/td[3]/span/span")), 10000)).getText();
        console.log("Product Name checked failed, Product Name - expected: " + name + ", value: " + text);
        driver.quit();
    }

    console.log('Product is added to Quote Lines!');
    driver.quit();
}

const args = process.argv.slice(2);
QLE_Test(args[0]);
// args.forEach(arg => {
//     console.log(arg);
//     quotesTest(arg);
// });

// a0p1I0000097Y3lQAE