import { db } from './src/db';
import { users } from './src/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from './src/utils/auth';

async function test() {
    try {
        const email = 'superadmin@saas.com';
        const password = 'SuperPass123!';
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        console.log('User found:', user.length > 0);
        if (user.length > 0) {
            console.log('Is Active:', user[0].isActive);
            console.log('User object keys:', Object.keys(user[0]));
            const hashedPassword = (user[0] as any).hashedPassword || (user[0] as any).hashed_password;
            console.log('Hashed Password exists:', !!hashedPassword);

            if (hashedPassword) {
                const isValid = await verifyPassword(password, hashedPassword);
                console.log('Password valid:', isValid);
            }
        }
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}

test();
