import { quotelineTest } from './test.js';
import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import chrome from 'selenium-webdriver/chrome.js';
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();
import { initialization } from '../helper_test/login.js';

const account = process.env.ACCOUNT;
const password = process.env.PASSWORD;

let options = new chrome.Options();
options.addArguments("--no-sandbox");
options.addArguments("--disable-dev-shm-usage");
// options.addArguments("--incognito");

let driver = new Builder()
                .forBrowser('chrome')
                .setChromeOptions(options)
                .build();

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

// node test_run a0p1I0000095NRXQA2 0051I000000dzesQAA 0051I000001yEr7QAE 0051I000006NbUOQA0 2 30 Subscription