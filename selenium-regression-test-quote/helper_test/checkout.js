import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();

export const checkout = async(quoteId, driver) => {
    // checkout shopify url
    await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/'+ quoteId + '/view');
    // wait for shopifyURL to be populated
    console.log('Sleep for one minute until we get the Shopify URL...')
    await driver.sleep(5000);
    // await driver.navigate().refresh();
    await driver.sleep(2000);
    let shopifyURL = [];
    try {
        shopifyURL = await driver.findElements(By.xpath("//span[.='Proceed to Order']"));
    }
    catch(e) {
        console.log('Waiting for the shopify url...');
    }
    let isPopulated = shopifyURL.length !== 0;
    let count = 1;
    try {
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
    }
    catch (e) {
        console.log(e);
    }
    

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
        process.exit(1);
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
        process.exit(1);
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
        process.exit(1);
    }

    // check company is read only
    try {
        await driver.wait(until.elementLocated(By.xpath("//div[@data-address-field='company']/div/input")),15000)
            .getAttribute("readonly")
            .then(text => {
                if (text) {
                    console.log('Company is read only!');
                }
                else {
                    throw new Error ('Company is not read only!');
                }
            })
    }
    catch(e) {
        console.log(e);
        process.exit(1);
    }

    // get state and zip code
    try {
        let state_select = await driver.wait(until.elementLocated(By.xpath("//select[@placeholder='State']")),15000);
        let zip_code = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='ZIP code']")),15000);
        await driver.actions().click(state_select).sendKeys('California').perform();
        await zip_code.clear();
        await driver.actions().click(zip_code).sendKeys('94304').perform();
        await state_select.getAttribute('value')
            .then(text => {
                console.log('State: ' + text);
            });
        await zip_code.getAttribute('value')
            .then(text => {
                console.log('Zip Code: ' + text);
            });
    }
    catch(e) {
        console.log('Getting state and zip code failed' + e);
        process.exit(1);
    }

    // continue to shipping
    try {
        let continue_to_shipping = await driver.wait(until.elementLocated(By.xpath("//span[.='Continue to shipping']")),15000);
        await driver.actions().click(continue_to_shipping).perform();

        console.log('Continue to shipping...');
    }
    catch(e) {
        console.log('Shipping failed!' + e);
    }

    // continue to payment
    try {
        let continue_to_payment = await driver.wait(until.elementLocated(By.xpath("//span[.='Continue to payment']")),15000);
        await driver.actions().click(continue_to_payment).perform();

        console.log('Continue to payment...');
    }
    catch(e) {
        console.log('Payment failed!' + e);
        process.exit(1);
    }

    // select order form
    try {
        let order_form = await driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Order Form')]")),15000);
        await driver.actions().click(order_form).perform();

        console.log('Select Order Form');
    }
    catch(e) {
        console.log('Selecting order form failed!' + e);
        process.exit(1);
    }

    // use a different billing address and check company is read only
    // try {
    //     let change_address = await driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'different billing address')]")),15000);
    //     await driver.actions().click(change_address).perform();

    //     console.log('Use a different billing address');
    // }
    // catch(e) {
    //     console.log(e);
    // }

    // try {
    //     await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Company']")),15000)
    //         .getAttribute("readonly")
    //         .then(text => {
    //             if (text) {
    //                 console.log('Company is read only!');
    //             }
    //             else {
    //                 throw new Error ('Company is not read only!');
    //             }
    //         })
    // }
    // catch(e) {
    //     console.log(e);
    //     process.exit(1);
    // }

    // pay now
    try {
        let pay_now = await driver.wait(until.elementLocated(By.xpath("//span[.='Complete order']")),15000);
        await driver.actions().click(pay_now).perform();

        console.log('Continue to payment...');
    }
    catch(e) {
        console.log('Payment failed!' + e);
        process.exit(1);
    }

    // switch tab
    try {
        let tabs = await driver.getAllWindowHandles();
        await driver.switchTo().window(tabs[0]);
    }
    catch(e) {
        console.log("Switching tab failed!" + e);
        process.exit(1);
    }
}