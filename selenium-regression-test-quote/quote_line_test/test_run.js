import { quotelineTest } from './test.js';
import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();

const account = process.env.ACCOUNT;
const password = process.env.PASSWORD;

let driver = new Builder().forBrowser('chrome').build();

// Initialization
const Initialization = async(driver) => {
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

let arg_5 = args[5];
if (args.length > 6) {
    arg_5 = '';
    for (let i=5; i<args.length; i++) {
        if (i === 5) arg_5 += args[i];
        else arg_5 += ' ' + args[i];
    }
}

const test_run = async() => {
    await Initialization(driver);
    // quoteId, ownerId, approverId, quantity, discount, license_model, driver
    await quotelineTest(args[0], args[1], args[2], args[3], args[4], arg_5, driver);
}

test_run();

// node test_run a0p2g000001ZD6FAAW 0051I000006lPqHQAU 0051I000001yEr7QAE 2 30 Subscription