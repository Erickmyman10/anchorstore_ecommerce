import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { config } from "dotenv";

config();

const prisma = new PrismaClient();

const USERNAME = "anchoradmin";
const PASSWORD = "Admin@2026!";
const EMAIL    = "admin@anchorstore.com";

async function main() {
  const hashedPassword = await argon2.hash(PASSWORD);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: USERNAME }, { email: EMAIL }] },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: hashedPassword, role: "ADMIN" },
    });
    console.log("✅ Existing user updated to ADMIN!");
  } else {
    await prisma.user.create({
      data: {
        username: USERNAME,
        email:    EMAIL,
        password: hashedPassword,
        role:     "ADMIN",
      },
    });
    console.log("✅ Admin user created!");
  }

  console.log("");
  console.log(`Username: ${USERNAME}`);
  console.log(`Password: ${PASSWORD}`);
  console.log(`Role:     ADMIN`);
  console.log(`Email:    ${EMAIL}`);
  console.log("");
  console.log("Use your ADMIN_AUTH_CODE to login at /admin/login");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
