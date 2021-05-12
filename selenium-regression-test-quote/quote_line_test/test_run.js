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

let arg_6 = args[6];
if (args.length > 7) {
    arg_6 = '';
    for (let i=6; i<args.length; i++) {
        if (i === 6) arg_6 += args[i];
        else arg_6 += ' ' + args[i];
    }
}

const test_run = async() => {
    await initialization(driver);
    // quoteId, ownerId, approverId, operationId quantity, discount, license_model, driver
    await quotelineTest(args[0], args[1], args[2], args[3], args[4], args[5], arg_6, driver);
}

test_run();

// node test_run a0p2g000001ZD6FAAW 0051I000006lPqHQAU 0051I000001yEr7QAE 0051I000006NbUOQA0 2 30 Subscription