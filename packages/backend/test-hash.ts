import { db } from './src/db';
import { users } from './src/schema';
import { eq } from 'drizzle-orm';

async function test() {
    try {
        const user = await db.select().from(users).where(eq(users.email, 'superadmin@saas.com')).limit(1);
        const hash = user[0].hashedPassword || (user[0] as any).hashed_password;
        console.log('HASH:', hash);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

test();
