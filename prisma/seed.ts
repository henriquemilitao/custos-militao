const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // 1 usuário
  const user = await prisma.user.create({
    data: {},
  });

  // 1 ciclo
  const ciclo = await prisma.ciclo.create({
    data: {
      dataInicio: new Date("2025-09-01"),
      dataFim: new Date("2025-09-30"),
      valorTotal: 1000,
      userId: user.id,
    },
  });

  // economias (2 exemplos)
  await prisma.economia.createMany({
    data: [
      { nome: "Reserva de emergência", valor: 200, isGuardado: false, cicloId: ciclo.id },
      { nome: "Viagem", valor: 150, isGuardado: false, cicloId: ciclo.id },
    ],
  });

  // gastos fixos/meta (3 exemplos)
  const gastos = await prisma.gasto.createMany({
    data: [
      { name: "Academia", valor: 120, tipo: "single", cicloId: ciclo.id },
      { name: "Streaming", valor: 50, tipo: "single", cicloId: ciclo.id },
      { name: "Lazer", valor: 300, tipo: "goal", cicloId: ciclo.id },
    ],
  });

  // semanas (2 exemplos)
  const semana1 = await prisma.semana.create({
    data: {
      qualSemanaCiclo: 1,
      dataInicio: new Date("2025-09-01"),
      dataFim: new Date("2025-09-07"),
      gastos: 0,
      cicloId: ciclo.id,
    },
  });

  const semana2 = await prisma.semana.create({
    data: {
      qualSemanaCiclo: 2,
      dataInicio: new Date("2025-09-08"),
      dataFim: new Date("2025-09-14"),
      gastos: 0,
      cicloId: ciclo.id,
    },
  });

  // registros de gastos (semana 1)
  await prisma.registroGasto.createMany({
    data: [
      { name: "Pizza", valor: 80, data: new Date("2025-09-03"), semanaId: semana1.id, gastoId: (await prisma.gasto.findFirst({ where: { name: "Lazer" } }))!.id },
      { name: "Cinema", valor: 50, data: new Date("2025-09-05"), semanaId: semana1.id, gastoId: (await prisma.gasto.findFirst({ where: { name: "Lazer" } }))!.id },
    ],
  });

  console.log("Seed concluído com sucesso ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
