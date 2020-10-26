import {expectType} from 'tsd';
import isOnline = require('.');

expectType<Promise<boolean>>(isOnline());
expectType<Promise<boolean>>(isOnline({timeout: 10}));
expectType<Promise<boolean>>(isOnline({ipVersion: 4}));
expectType<Promise<boolean>>(isOnline({ipVersion: 6}));
