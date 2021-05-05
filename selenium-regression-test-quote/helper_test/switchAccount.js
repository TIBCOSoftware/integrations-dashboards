import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();

export const switchAccount = async (quoteId, action, driver, userId) => {
    let curr_user = '';
    let user = '';
    // get current user
    try {
        await driver.sleep(2000);
        let userImg = driver.findElement(By.xpath("(//span[@class='uiImage'])[1]"));
        await driver.sleep(2000);
        await driver.actions().click(userImg).perform();
        // await driver.wait(until.elementLocated(By.xpath("(//span[@class='uiImage'])[1]")), 20000).click();
        await driver.sleep(1000);
        curr_user += await driver.wait(until.elementLocated(By.xpath("//h1[@class='profile-card-name']/a")), 20000).getText();
        await driver.sleep(2000);
        await driver.actions().click(userImg).perform();
        console.log("Current User: " + curr_user);
        //await driver.wait(until.elementLocated(By.xpath("(//span[@class='uiImage'])[1]")), 20000).click();
    }
    catch (e) {
        console.log("Check current account failed!");
        console.log(e);
    }
    await driver.sleep(2000);

    // find the user
    try {
        await driver.sleep(2000);
        await driver.get('https://tibcocpq--sandbox.lightning.force.com/lightning/setup/ManageUsers/page?address=/' + userId + '?noredirect=1&isUserEntityOverride=1');
        // check if current user is the user user
        await (await driver).switchTo().defaultContent();
        const frame2 = await driver.wait(until.elementLocated(By.xpath("//*[@id='setupComponent']/div[2]/div/div/force-aloha-page/div/iframe")));
        await (await driver).switchTo().frame(frame2);
        user += await driver.wait(until.elementLocated(By.xpath("//td[.='Name']/following::td[1]")), 20000).getText();
        console.log('User: ' + user);
    }
    catch (e) {
        console.log("Finding User Failed: " + e);
        await driver.quit();
        process.exit(1);
    }

    if (action === 'login') {
        console.log('Logging in with user account...')
        await driver.sleep(5000);
        // log in
        if (user === curr_user) {
            console.log('Already logged in!');
            await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/' + quoteId + '/view');
        }
        else {
            try {
                await (await driver).sleep(2000);
                await (await driver).switchTo().defaultContent();
                const frame3 = await driver.wait(until.elementLocated(By.xpath("//*[@id='setupComponent']/div[2]/div/div/force-aloha-page/div/iframe")));
                await (await driver).switchTo().frame(frame3);
                await driver.wait(until.elementLocated(By.xpath("//*[@id='topButtonRow']/input[@name='login']")), 20000).click();
                await (await driver).sleep(5000);
                await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/' + quoteId + '/view');
            }
            catch (e) {
                console.log('Log in failed!' + e);
                process.exit(1);
            }
        }
    }
    else if (action === 'logout') {
        console.log('Logging out from user account...');
        // log out
        if (user === curr_user) {
            try {
                await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/' + quoteId + '/view');
                await driver.sleep(5000);
                await driver.wait(until.elementLocated(By.xpath("(//span[@class='uiImage'])[1]")), 20000).click();
                await driver.wait(until.elementLocated(By.xpath("//a[@class='profile-link-label logout uiOutputURL']")), 20000).click();
            }
            catch (e) {
                console.log('Logged out failed!' + e);
                process.exit(1);
            }
        }
        else {
            console.log('Already logged out!');
        }

        await driver.sleep(5000);
        await (await driver).get('https://tibcocpq--sandbox.lightning.force.com/lightning/r/SBQQ__Quote__c/' + quoteId + '/view');
    }
    console.log(action + ' completed!');
    await (await driver).sleep(5000);
}