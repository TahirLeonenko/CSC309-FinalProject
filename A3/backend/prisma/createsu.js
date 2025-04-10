/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // We expect exactly 3 additional arguments for utorid, email, and password
  if (process.argv.length < 5) {
    console.error('Usage: node prisma/createsu.js <utorid> <email> <password>');
    process.exit(1);
  }

  const utorid = process.argv[2];
  const email = process.argv[3];
  const password = process.argv[4];

  try {
    // Create a new superuser, storing password in plain text
    const user = await prisma.user.create({
      data: {
        utorid,
        email,
        name: 'Superuser '+utorid, 
        password,
        verified: true,
        role: 'SUPERUSER'
      }
    });

    console.log(`Superuser created successfully!`);
    console.log(`ID: ${user.id}, UTORID: ${user.utorid}, Email: ${user.email}`);
  } catch (error) {
    console.error('Error creating superuser:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
