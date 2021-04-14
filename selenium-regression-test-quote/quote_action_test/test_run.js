import { quotesTest } from './test.js';
import pkg from 'selenium-webdriver';
const {Builder, By, Key, until} = pkg;
import 'chromedriver';
import dotenv from 'dotenv';
dotenv.config();

let driver = new Builder().forBrowser('chrome').build();
const args = process.argv.slice(2);
// (quoteId, action, profile, driver)
quotesTest(args[0], args[1], args[2], driver);

// node test_run a0p2g000001ZD6FAAW submit Renewals