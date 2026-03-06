const bcrypt = require('bcrypt');

/**
 * Run this script to verify that your bcrypt library 
 * correctly matches the passwords with the hashes in complete_setup.sql.
 */
async function verify() {
    const tests = [
        {
            label: 'Super Admin',
            password: 'SuperPass123!',
            hash: '$2b$12$j5Tw0V1gVAcor057cat31.r.lY4GUKOWnmhnrCjDhkJ3D/iLy968m'
        },
        {
            label: 'Admin',
            password: 'AdminPass123!',
            hash: '$2b$12$RNtzFZuZqkrWs52Q1yfJY.n8FLHotToipdXRb5s0nNwrDym0eXmcm'
        },
        {
            label: 'User',
            password: 'UserPass123!',
            hash: '$2b$12$qpErwohhCCB/PNn55HjpcOurTXbLFH08LD4ZCmj4l5dbc2TGdAaB.'
        },
        {
            label: 'Standard (gamesme)',
            password: '12345678',
            hash: '$2b$12$efMU73gYl2d29Uc1GnOnVenQeOHm4MZNCsDTJMk/1pwkoPORd34KC'
        }
    ];

    console.log('=== Authentication Verification Diagnostic ===\n');

    for (const test of tests) {
        try {
            const match = await bcrypt.compare(test.password, test.hash);
            console.log(`${test.label.padEnd(20)}: ${match ? '✅ MATCH' : '❌ FAIL'}`);
        } catch (err) {
            console.log(`${test.label.padEnd(20)}: ❌ ERROR (${err.message})`);
        }
    }

    console.log('\nIf any test fails, please let the assistant know.');
}

verify();
