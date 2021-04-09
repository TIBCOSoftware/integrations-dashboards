import { quotelineTest } from './test.js';
import dotenv from 'dotenv';
dotenv.config();

const args = process.argv.slice(2);

let arg_4 = args[4];
if (args.length > 5) {
    arg_4 = '';
    for (let i=4; i<args.length; i++) {
        if (i === 4) arg_4 += args[i];
        else arg_4 += ' ' + args[i];
    }
}

quotelineTest(args[0], args[1], args[2], args[3], arg_4);

// quoteId, profile, quantity, discount, license_model

// node --experimental-modules test_run a0p2g000001ZBh8AAG Renewals 2 20 Subscription
