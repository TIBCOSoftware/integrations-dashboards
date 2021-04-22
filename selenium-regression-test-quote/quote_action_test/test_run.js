import { quotesTest } from './test.js';
import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();

const account = process.env.ACCOUNT;
const password = process.env.PASSWORD;

let driver = new Builder().forBrowser('chrome').build();
// Initialization
const initialization = async(driver) => {
    // Open the sandbox
    await (await driver).manage().setTimeouts({ implicit:10000 });
    await driver.get('https://tibcocpq--sandbox.lightning.force.com/lightning/page/home');

    // Log in with email and password
    await driver.findElement(By.css('#email')).sendKeys(account);
    await driver.findElement(By.css('#next')).click();
    await driver.wait(until.elementLocated(By.css('#password'))).sendKeys(password);
    await driver.wait(until.elementLocated(By.css('#taLogin'))).click();
}


const args = process.argv.slice(2);
// (quoteId, action, userId, driver)
const test_run = async() => {
    await initialization(driver);
    await quotesTest(args[0], args[1], args[2], driver);
    await (await driver).quit();
}

test_run();


// node test_run a0p2g000001ZD6FAAW submit Renewals

// user id: 0051I000006NbUJQA0