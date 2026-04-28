import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create a User
  const user = await prisma.user.create({
    data: {
      name: "Akbar Toshev",
      email: "akbar@email.com",
      role: "user",
    },
  });

  // 2. Create Pets
  await prisma.pet.createMany({
    data: [
      { name: "Biscuit", species: "Dog", breed: "Golden Retriever", age: "3 yrs", weight: "28 kg", ownerId: user.id },
      { name: "Luna", species: "Cat", breed: "Persian", age: "1.5 yrs", weight: "4.2 kg", ownerId: user.id },
    ],
  });

  // 3. Create Vets
  const vetsData = [
    { name: "Dr. Malika Yusupova", spec: "Small Animal Surgery", clinic: "Tashkent Animal Clinic", district: "Yunusabad", rating: 4.9, reviews: 142, exp: "8 yrs", price: "80,000", avail: true, slots: ["09:00", "10:30", "14:00", "15:30"] },
    { name: "Dr. Bobur Rahimov", spec: "Dermatology & Nutrition", clinic: "Happy Paws Vet Center", district: "Mirzo-Ulugbek", rating: 4.8, reviews: 98, exp: "5 yrs", price: "60,000", avail: true, slots: ["11:00", "13:00", "16:00"] },
    { name: "Dr. Nilufar Karimova", spec: "Exotic Animals", clinic: "Pet Health Hub", district: "Chilonzor", rating: 4.7, reviews: 56, exp: "10 yrs", price: "100,000", avail: false, slots: [] },
  ];

  const createdVets = await Promise.all(
    vetsData.map(v => prisma.vet.create({ data: v }))
  );

  // 4. Create Appointments
  await prisma.appointment.createMany({
    data: [
      { vetId: createdVets[0].id, userId: user.id, date: "Apr 28 · 09:00", status: "Upcoming" },
      { vetId: createdVets[1].id, userId: user.id, date: "Apr 15 · 11:00", status: "Completed" },
    ],
  });

  // 5. Create Products
  await prisma.product.createMany({
    data: [
      { name: "Royal Canin Adult — Salmon Recipe", price: 89000, oldPrice: 120000, rating: 4.8, reviews: 234, tag: "Bestseller", img: "/prod-1.jpg", brand: "Royal Canin", cat: "Food & Treats" },
      { name: "Cat Interactive Feather Toy Set", price: 45000, rating: 4.6, reviews: 89, tag: "New", img: "/prod-2.jpg", brand: "Zooplus", cat: "Toys" },
      { name: "Beaphar Dog Shampoo Sensitive 500ml", price: 32000, oldPrice: 40000, rating: 4.7, reviews: 156, tag: "Sale", img: "/prod-3.jpg", brand: "Beaphar", cat: "Grooming" },
    ],
  });

  // 6. Create Articles
  await prisma.article.createMany({
    data: [
      { title: "10 Foods Your Dog Should Never Eat", cat: "Nutrition", read: "5 min", date: "Apr 20", author: "Dr. Bobur Rahimov", excerpt: "" },
      { title: "How to Prepare Your Cat for a Vet Visit", cat: "Health", read: "4 min", date: "Apr 18", author: "Dr. Nilufar Karimova", excerpt: "" },
      { title: "Understanding Dog Body Language", cat: "Behavior", read: "7 min", date: "Apr 15", author: "Dr. Malika Yusupova", excerpt: "" },
    ],
  });

  // 7. Create Orders
  await prisma.order.createMany({
    data: [
      { item: "Royal Canin Adult — Salmon Recipe", date: "Apr 22", status: "Delivered", price: "89,000", img: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=80&h=80&fit=crop&q=80", userId: user.id },
      { item: "Cat Interactive Feather Toy Set", date: "Apr 18", status: "In Transit", price: "45,000", img: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=80&h=80&fit=crop&q=80", userId: user.id },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
