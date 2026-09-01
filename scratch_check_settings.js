
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const settings = await prisma.systemSetting.findMany();
  console.log('SystemSettings in DB:', JSON.stringify(settings, null, 2));
}
main().finally(() => prisma.());
