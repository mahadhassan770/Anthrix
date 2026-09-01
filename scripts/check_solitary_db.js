const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_A4CLrq0njQFw@ep-solitary-morning-axp07703-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    },
  },
});

async function check() {
  const [clients, invoices, bankAccounts, transactions, messages, projects, services, users] = await Promise.all([
    prisma.client.findMany().catch(e => ({ error: e.message })),
    prisma.invoice.findMany().catch(e => ({ error: e.message })),
    prisma.bankAccount.findMany().catch(e => ({ error: e.message })),
    prisma.transaction.findMany().catch(e => ({ error: e.message })),
    prisma.message.findMany().catch(e => ({ error: e.message })),
    prisma.project.findMany().catch(e => ({ error: e.message })),
    prisma.service.findMany().catch(e => ({ error: e.message })),
    prisma.user.findMany().catch(e => ({ error: e.message })),
  ]);

  console.log("=== AUDIT RESULTS FOR ep-solitary-morning ===");
  console.log({
    clientsCount: Array.isArray(clients) ? clients.length : clients,
    invoicesCount: Array.isArray(invoices) ? invoices.length : invoices,
    bankAccountsCount: Array.isArray(bankAccounts) ? bankAccounts.length : bankAccounts,
    transactionsCount: Array.isArray(transactions) ? transactions.length : transactions,
    messagesCount: Array.isArray(messages) ? messages.length : messages,
    projectsCount: Array.isArray(projects) ? projects.length : projects,
    servicesCount: Array.isArray(services) ? services.length : services,
    usersCount: Array.isArray(users) ? users.length : users,
  });

  if (Array.isArray(clients) && clients.length > 0) {
    console.log("Clients:", clients);
  }
  if (Array.isArray(invoices) && invoices.length > 0) {
    console.log("Invoices:", invoices);
  }
  if (Array.isArray(transactions) && transactions.length > 0) {
    console.log("Transactions:", transactions);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
