const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // 1 usuário
  const user = await prisma.user.create({
    id: '978dbd3e-ff8c-4344-90af-0be8e53a9346',
    data: {},
  });

  // 1 ciclo
  const ciclo = await prisma.ciclo.create({
    data: {
      dataInicio: new Date("2025-09-01"),
      dataFim: new Date("2025-09-30"),
      valorTotal: 1000,
      quantidadeSemanas: 4, // ✅ obrigatório agora
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

  // gastos (criando individualmente para pegar IDs)
  const academia = await prisma.gasto.create({
    data: {
      name: "Academia",
      valor: 120,
      tipo: "single",
      cicloId: ciclo.id,
      isPago: true,
    },
  });

  const streaming = await prisma.gasto.create({
    data: {
      name: "Streaming",
      valor: 50,
      tipo: "single",
      cicloId: ciclo.id,
      isPago: false,
    },
  });

  const lazer = await prisma.gasto.create({
    data: {
      name: "Lazer",
      valor: 300,
      tipo: "goal",
      cicloId: ciclo.id,
      isPago: false,
    },
  });

  // semanas (2 exemplos)
  const semana1 = await prisma.semana.create({
    data: {
      qualSemanaCiclo: 1,
      dataInicio: new Date("2025-09-01"),
      dataFim: new Date("2025-09-07"),
      cicloId: ciclo.id,
    },
  });

  const semana2 = await prisma.semana.create({
    data: {
      qualSemanaCiclo: 2,
      dataInicio: new Date("2025-09-08"),
      dataFim: new Date("2025-09-14"),
      cicloId: ciclo.id,
    },
  });

  // registros de gastos (semana 1, vinculados ao gasto "Lazer")
  await prisma.registroGasto.createMany({
    data: [
      {
        name: "Pizza",
        valor: 80,
        data: new Date("2025-09-03"),
        semanaId: semana1.id,
        gastoId: lazer.id,
      },
      {
        name: "Cinema",
        valor: 50,
        data: new Date("2025-09-05"),
        semanaId: semana1.id,
        gastoId: lazer.id,
      },
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
