import { quotesTest } from './test.js';
import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();
import { initialization } from '../helper_test/login.js';

const account = process.env.ACCOUNT;
const password = process.env.PASSWORD;

let driver = new Builder().forBrowser('chrome').build();

const args = process.argv.slice(2);
// (quoteId, action, userId, driver)
const test_run = async() => {
    await initialization(driver);
    await quotesTest(args[0], args[1], args[2], driver);
    await (await driver).quit();
}

test_run();