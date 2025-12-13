/**
 * Script to create a Guest account for view-only access
 * 
 * Usage:
 *   npx tsx scripts/create-guest-account.ts
 * 
 * Or with custom credentials:
 *   GUEST_EMAIL=guest@example.com GUEST_PASSWORD=guest123 npx tsx scripts/create-guest-account.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createGuestAccount() {
  const guestEmail = process.env.GUEST_EMAIL || 'guest@example.com';
  const guestPassword = process.env.GUEST_PASSWORD || 'guest123';
  const guestName = process.env.GUEST_NAME || 'Guest User';

  try {
    // Check if guest account already exists
    const existingGuest = await prisma.user.findUnique({
      where: { email: guestEmail },
    });

    if (existingGuest) {
      // Update existing guest account
      const hashedPassword = await bcrypt.hash(guestPassword, 10);
      await prisma.user.update({
        where: { email: guestEmail },
        data: {
          name: guestName,
          password: hashedPassword,
          role: 'GUEST',
        },
      });
      console.log(`✅ Guest account updated successfully!`);
      console.log(`   Email: ${guestEmail}`);
      console.log(`   Password: ${guestPassword}`);
      console.log(`   Role: GUEST`);
    } else {
      // Create new guest account
      const hashedPassword = await bcrypt.hash(guestPassword, 10);
      await prisma.user.create({
        data: {
          email: guestEmail,
          name: guestName,
          password: hashedPassword,
          role: 'GUEST',
        },
      });
      console.log(`✅ Guest account created successfully!`);
      console.log(`   Email: ${guestEmail}`);
      console.log(`   Password: ${guestPassword}`);
      console.log(`   Role: GUEST`);
    }

    console.log(`\n📝 Login credentials:`);
    console.log(`   Email: ${guestEmail}`);
    console.log(`   Password: ${guestPassword}`);
    console.log(`\n⚠️  Note: Guest users have view-only access and cannot create, edit, or delete any data.`);
  } catch (error) {
    console.error('❌ Error creating guest account:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createGuestAccount();
