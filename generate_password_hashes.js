const bcrypt = require('bcrypt');

async function generatePasswordHashes() {
  try {
    // Generate hashes for your specific passwords
    const superAdminPass = 'SuperPass123!';
    const adminPass = 'AdminPass123!';
    const userPass = 'UserPass123!';

    const superAdminHash = await bcrypt.hash(superAdminPass, 12);
    const adminHash = await bcrypt.hash(adminPass, 12);
    const userHash = await bcrypt.hash(userPass, 12);

    console.log('=== Generated Password Hashes ===');
    console.log(`SuperPass123! -> ${superAdminHash}`);
    console.log(`AdminPass123! -> ${adminHash}`);
    console.log(`12345678 -> ${userHash}`);

    console.log('\n=== SQL Update Commands ===');
    console.log(`UPDATE users SET hashed_password = '${superAdminHash}' WHERE email = 'superadmin@saas.com';`);
    console.log(`UPDATE users SET hashed_password = '${adminHash}' WHERE email = 'admin@saas.com';`);
    console.log(`UPDATE users SET hashed_password = '${userHash}' WHERE email = 'user@saas.com';`);

  } catch (error) {
    console.error('Error generating hashes:', error);
  }
}

generatePasswordHashes();
