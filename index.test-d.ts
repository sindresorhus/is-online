import {expectType} from 'tsd';
import isOnline from './index.js';

expectType<Promise<boolean>>(isOnline());
expectType<Promise<boolean>>(isOnline({timeout: 10}));
expectType<Promise<boolean>>(isOnline({ipVersion: 4}));
expectType<Promise<boolean>>(isOnline({ipVersion: 6}));
