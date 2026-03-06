import * as mysqlCore from 'drizzle-orm/mysql-core';
console.log(Object.keys(mysqlCore).filter(k => k.toLowerCase().includes('int')));
