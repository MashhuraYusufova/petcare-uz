import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting analytics seed...");

  // Fetch all products to pick randomly
  const products = await prisma.product.findMany();
  if (products.length === 0) {
    console.log("No products found! Please add some products first.");
    return;
  }

  const statuses = ["Completed", "Processing", "Shipped", "Delivered"];

  // Generate 25 users
  const createdUsers = [];
  const passwordHash = await bcrypt.hash('password123', 10);
  
  console.log("Generating 25 users...");
  for (let i = 1; i <= 25; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Analytics User ${i}`,
        email: `analytics.user${i}_${Date.now()}@example.com`,
        password: passwordHash,
        role: "user"
      }
    });
    createdUsers.push(user);
  }

  console.log("Generated 25 users successfully.");
  console.log("Generating 5 orders for each user...");

  const ordersToCreate = [];

  for (const user of createdUsers) {
    for (let j = 0; j < 5; j++) {
      // Pick a random product
      const product = products[Math.floor(Math.random() * products.length)];
      
      // Random date within the last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      ordersToCreate.push({
        item: product.name,
        date: date.toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        price: product.price.toString(),
        img: product.img,
        userId: user.id
      });
    }
  }

  // Use createMany to insert all orders at once
  const result = await prisma.order.createMany({
    data: ordersToCreate
  });

  console.log(`Successfully created ${result.count} orders.`);
  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
