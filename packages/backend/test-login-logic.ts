import bcrypt from 'bcrypt';
import { getUserByEmail, updateLastLogin } from './src/database';

async function test() {
    try {
        const cleanEmail = 'superadmin@saas.com';
        const cleanPassword = 'SuperPass123!';

        console.log('1. Get user');
        const user = await getUserByEmail(cleanEmail);
        if (!user) throw new Error('User not found');

        console.log('2. Check hash');
        const storedHash = user.hashed_password || user.hashedPassword;
        console.log('Stored hash:', storedHash);

        console.log('3. Compare');
        const isValidPassword = await bcrypt.compare(cleanPassword, storedHash);
        console.log('Is valid:', isValidPassword);

        console.log('4. Update last login');
        await updateLastLogin(user.id);

        console.log('Done!');
    } catch (e) {
        console.error('FAILED:', e);
    }
    process.exit(0);
}

test();
