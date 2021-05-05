import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();

export const checkout = async(quoteId, driver) => {
    // await Initialization(driver);
    await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');
    // wait for shopifyURL to be populated
    await driver.sleep(50000);
    await driver.navigate().refresh();
    await driver.sleep(2000);
    let shopifyURL = await driver.findElements(By.xpath("//span[.='Proceed to Order']"));
    let isPopulated = shopifyURL.length !== 0;
    let count = 1;
    while (!isPopulated) {
        console.log('Try ' + count + ' times!');
        await driver.sleep(4000);
        await driver.navigate().refresh();
        await driver.sleep(2000);
        count++;
        shopifyURL = await driver.findElements(By.xpath("//span[.='Proceed to Order']"));
        isPopulated = shopifyURL.length !== 0;
        if (count === 10) {
            throw new Error('ShopfyURL is not populated!');
        }
    }
    console.log('ShopifyURL is populated!');

    // go to shopifyURL
    await driver.sleep(5000);
    let navigate_to_shopify = await driver.wait(until.elementLocated(By.xpath("//a[.='Proceed to Order']")),10000);
    await driver.actions().click(navigate_to_shopify).perform();

    // switch tab
    try {
        let tabs = await driver.getAllWindowHandles();
        await driver.switchTo().window(tabs[1]);
    }
    catch(e) {
        console.log("Switching tab failed!" + e);
        process.exit(1);
    }
    
    // refresh to close popup
    await driver.sleep(10000);
    console.log('closing popup...');
    await driver.navigate().refresh();
    
    // add a new product to cart
    try {
        let searchbar = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='What are you looking for?']")),15000);
        await driver.actions().click(searchbar).sendKeys('Statistica').perform();
        
        let first_product = await driver.wait(until.elementLocated(By.xpath("(//div[@class='search-flydown--product-items'])[2]/a[1]")),15000);
        await driver.actions().click(first_product).perform();
    
        let add_to_cart = await driver.wait(until.elementLocated(By.xpath("//button[@type='submit']")),15000);
        await driver.actions().click(add_to_cart).perform();
    
        let view_cart = await driver.wait(until.elementLocated(By.xpath("(//a[contains(text(), 'View cart')])[2]")),15000);
        await driver.actions().click(view_cart).perform();
        
        console.log('A new product added!');
    }
    catch(e) {
        console.log('Adding a new product failed!' + e);
    }
   
    // checkout after agreeing the terms
    try {
        let agreement = await driver.wait(until.elementLocated(By.xpath("//input[@type='checkbox']")),15000);
        await driver.actions().click(agreement).perform();

        let check_out = await driver.wait(until.elementLocated(By.xpath("//button[@name='checkout']")),15000);
        await driver.actions().click(check_out).perform();

        console.log('Checking out...');
    }
    catch(e) {
        console.log('Checkout failed!' + e);
    }
    
    // change email 
    try {
        let email1 = await driver.wait(until.elementLocated(By.xpath("(//input[@type='email'])[1]")),15000);
        await email1.clear();
        await driver.actions().click(email1).sendKeys('checkout_test@tibco.com').perform();

        let email2 = await driver.wait(until.elementLocated(By.xpath("(//input[@type='email'])[2]")),15000);
        await driver.actions().click(email2).sendKeys('checkout_test@tibco.com').perform();

        console.log('Email changed!');
    }
    catch(e) {
        console.log('Changind email failed!' + e);
    }

    // continue to checkout
    try {
        let continue_to_checkout = await driver.wait(until.elementLocated(By.xpath("//span[.='Continue to shipping']")),15000);
        await driver.actions().click(continue_to_checkout).perform();

        console.log('Continue to checkout...');
    }
    catch(e) {
        console.log('Changind email failed!' + e);
    }
}