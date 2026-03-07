const bcrypt = require('bcrypt');

bcrypt.hash('SuperPass123!', 10).then(hash => {
    console.log('--- HASH GENERATION COMPLETE ---');
    console.log('Hash length:', hash.length);
    console.log('SQL UPDATE:');
    console.log(`UPDATE users SET hashed_password = '${hash}' WHERE email = 'superadmin@saas.com';`);
    console.log('\nDB VERIFICATION SQL - run in phpMyAdmin:');
    console.log("SELECT email, LENGTH(hashed_password) as hash_len, LEFT(hashed_password, 10) as hash_preview, is_active FROM users WHERE email = 'superadmin@saas.com';");
});
