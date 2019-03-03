import {expectType} from 'tsd-check';
import isOnline from '.';

expectType<Promise<boolean>>(isOnline());
expectType<Promise<boolean>>(isOnline({timeout: 10}));
expectType<Promise<boolean>>(isOnline({version: 'v4'}));
expectType<Promise<boolean>>(isOnline({version: 'v6'}));
