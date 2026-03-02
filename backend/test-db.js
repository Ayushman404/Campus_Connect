import prisma from './lib/prisma.js';

async function main() {
  console.log('🚀 Starting Database Connection Test...');

  try {
    // 1. Create a Test User
    const newUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@iitp.ac.in`,
        name: 'Test Student',
        role: 'STUDENT',
        provider: 'LOCAL',
      },
    });
    console.log('✅ Success: Created User:', newUser);

    // 2. Read the User back
    const user = await prisma.user.findUnique({
      where: { id: newUser.id },
    });
    console.log('✅ Success: Fetched User from DB:', user.name);

    // 3. Clean up (Optional: delete the test user)
    await prisma.user.delete({
      where: { id: newUser.id },
    });
    console.log('🧹 Cleaned up test data.');
    
    console.log('\n⭐ DATABASE IS FULLY OPERATIONAL!');
  } catch (error) {
    console.error('❌ Database Test Failed!');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();