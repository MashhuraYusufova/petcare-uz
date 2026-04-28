import { PrismaClient } from '@prisma/client';
import { assertVetEmailAvailable } from '../services/vet-email.service';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting vets seed...");

  const vetNames = ["Azizbek Rustamov", "Dilshod Karimov", "Gulnora Aliyeva", "Nargiza Qodirova"];
  const clinics = ["PetCare Hayvonot Klinikasi", "Salomat Hayvon", "Toshkent Vet Markazi", "Mehribon Qollar"];
  const districts = ["Yunusobod", "Mirzo Ulugbek", "Chilonzor", "Yashnobod"];
  const specs = ["Umumiy Amaliyot", "Xirurg", "Dermatolog", "Tish shifokori"];

  for (let i = 0; i < 4; i++) {
    const email = `vet${Date.now()}_${i}@petcare.uz`;
    await assertVetEmailAvailable(email);

    await prisma.vet.create({
      data: {
        name: vetNames[i],
        spec: specs[i],
        clinic: clinics[i],
        district: districts[i],
        rating: 4.5 + Math.random() * 0.5, // 4.5 to 5.0
        reviews: Math.floor(Math.random() * 50) + 10,
        exp: `${Math.floor(Math.random() * 10) + 2} yil`,
        price: `${(Math.floor(Math.random() * 5) + 1) * 50},000 sum`,
        avail: true,
        slots: ["09:00", "11:00", "14:00", "16:00"],
        email: email
      }
    });
  }

  console.log("Successfully created 4 Uzbek vets.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
