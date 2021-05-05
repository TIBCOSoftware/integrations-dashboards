import { quotelineTest } from './test.js';
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

let arg_5 = args[5];
if (args.length > 6) {
    arg_5 = '';
    for (let i=5; i<args.length; i++) {
        if (i === 5) arg_5 += args[i];
        else arg_5 += ' ' + args[i];
    }
}

const test_run = async() => {
    await initialization(driver);
    // quoteId, ownerId, approverId, quantity, discount, license_model, driver
    await quotelineTest(args[0], args[1], args[2], args[3], args[4], arg_5, driver);
}

test_run();