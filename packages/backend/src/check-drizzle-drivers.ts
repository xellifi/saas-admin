import * as mysql2 from 'drizzle-orm/mysql2';
import * as nodePostgres from 'drizzle-orm/node-postgres';
console.log('mysql2 exports:', Object.keys(mysql2));
console.log('node-postgres exports:', Object.keys(nodePostgres));
