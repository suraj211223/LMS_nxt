import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to DB using Prisma Client');

  // Find users where password_hash doesn't look like a bcrypt hash
  const users = await prisma.users.findMany({
    select: { user_id: true, email: true, password_hash: true },
  });

  const toUpdate = users.filter(
    (u) => !(typeof u.password_hash === 'string' && /^\$2[abxy]\$/.test(u.password_hash))
  );

  if (!toUpdate.length) {
    console.log('No plaintext password_hash values found; nothing to do.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${toUpdate.length} users with non-bcrypt password_hash values. (Sample)`);
  console.table(
    toUpdate.map((u) => ({
      id: u.user_id,
      email: u.email,
      currentValuePreview: String(u.password_hash).slice(0, 30),
    }))
  );

  const shouldRun = process.argv.includes('--run') || process.argv.includes('-r');
  if (!shouldRun) {
    console.log('\nDry-run only. To perform updates run: node prisma/hash-plaintext-passwords.js --run');
    await prisma.$disconnect();
    return;
  }

  console.log('\nProceeding to hash and update these users (this is irreversible).');

  for (const u of toUpdate) {
    const cleartext = String(u.password_hash || '');
    // don't hash empty; if empty set a strong random password
    let source = cleartext.trim();
    if (!source) {
      // generate a random fallback password and inform
      source = Math.random().toString(36).slice(2, 12);
      console.log(
        `User ${u.email} had empty password; creating random password (kept only in DB) for safety.`
      );
    }

    const hashed = bcrypt.hashSync(source, 10);
    await prisma.users.update({
      where: { user_id: u.user_id },
      data: { password_hash: hashed },
    });
    console.log(`Updated user ${u.user_id} (${u.email})`);
  }

  console.log('\nAll updates complete. Verifying sample...');
  const newUsers = await prisma.users.findMany({
    where: { user_id: { in: toUpdate.map((u) => u.user_id) } },
    select: { user_id: true, email: true, password_hash: true },
  });
  console.table(
    newUsers.map((u) => ({
      id: u.user_id,
      email: u.email,
      newPreview: String(u.password_hash).slice(0, 8),
    }))
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
