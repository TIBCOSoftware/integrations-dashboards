import { quotesTest } from './test.js';
import dotenv from 'dotenv';
dotenv.config();

const args = process.argv.slice(2);
quotesTest(args[0], args[1]);

// args.forEach(arg => {
//     console.log(arg);
//     quotesTest(arg);
// });
 
// a0p1I000008UOIOQA4 submit