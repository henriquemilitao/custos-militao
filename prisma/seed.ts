import { PrismaClient } from "@prisma/client";
import { startOfDay } from "date-fns";
import bcrypt from "bcryptjs"; // precisa instalar: npm install bcryptjs

const prisma = new PrismaClient();

function normalize(date: string | Date): Date {
  return startOfDay(new Date(date));
}

async function main() {
  // hash da senha que você quiser
  const hashedPassword = await bcrypt.hash("12345678", 10);

  // cria user
  // const user = await prisma.user.create({
  //   data: {
  //     id: "978dbd3e-ff8c-4344-90af-0be8e53a9346",
  //     email: "h@h.com",
  //     name: "Henrique",
  //   },
  // });

  // cria account com a senha
  // await prisma.account.create({
  //   data: {
  //     accountId: 'a@a.com',    // pode usar o próprio email como identificador
  //     providerId: "credentials", // provider local
  //     userId: '6X58BvAeurnjVQ4JasiKiGZeTzKohbX0',
  //     password: hashedPassword, // senha em hash bcrypt
  //   },
  // });

  // ciclo, economias, gastos etc. (resto do seu seed igual)
  const ciclo = await prisma.ciclo.create({
    data: {
      dataInicio: normalize("2025-09-20"),
      dataFim: normalize("2025-10-19"),
      valorTotal: 1000,
      quantidadeSemanas: 4,
      userId: 'eLn4B5SQnlTvWg3XE19PnIiWmftdGSmT',
    },
  });

  // economias
  // await prisma.economia.createMany({
  //   data: [
  //     { nome: "Reserva de emergência", valor: 200, isGuardado: false, cicloId: ciclo.id },
  //     { nome: "Viagem", valor: 150, isGuardado: false, cicloId: ciclo.id },
  //   ],
  // });

  // gastos
  // const academia = await prisma.gasto.create({
  //   data: {
  //     name: "Academia",
  //     valor: 120,
  //     tipo: "single",
  //     cicloId: ciclo.id,
  //     isPago: true,
  //   },
  // });

  // const streaming = await prisma.gasto.create({
  //   data: {
  //     name: "Streaming",
  //     valor: 50,
  //     tipo: "single",
  //     cicloId: ciclo.id,
  //     isPago: false,
  //   },
  // });

  // const lazer = await prisma.gasto.create({
  //   data: {
  //     name: "Lazer",
  //     valor: 300,
  //     tipo: "goal",
  //     cicloId: ciclo.id,
  //     isPago: false,
  //   },
  // });

  // semanas
  const semana1 = await prisma.semana.create({
    data: {
      qualSemanaCiclo: 1,
      dataInicio: normalize("2025-09-20"),
      dataFim: normalize("2025-09-26"),
      cicloId: ciclo.id,
    },
  });

  const semana2 = await prisma.semana.create({
    data: {
      qualSemanaCiclo: 2,
      dataInicio: normalize("2025-09-27"),
      dataFim: normalize("2025-10-03"),
      cicloId: ciclo.id,
    },
  });

  const semana3 = await prisma.semana.create({
    data: {
      qualSemanaCiclo: 3,
      dataInicio: normalize("2025-10-04"),
      dataFim: normalize("2025-10-10"),
      cicloId: ciclo.id,
    },
  });

  const semana4 = await prisma.semana.create({
    data: {
      qualSemanaCiclo: 4,
      dataInicio: normalize("2025-10-11"),
      dataFim: normalize("2025-10-19"),
      cicloId: ciclo.id,
    },
  });

  // // registros de gastos
  // await prisma.registroGasto.createMany({
  //   data: [
  //     {
  //       name: "Pizza",
  //       valor: 80,
  //       data: normalize("2025-09-03"),
  //       semanaId: semana1.id,
  //       gastoId: lazer.id,
  //     },
  //     {
  //       name: "Cinema",
  //       valor: 50,
  //       data: normalize("2025-09-05"),
  //       semanaId: semana1.id,
  //       gastoId: lazer.id,
  //     },
  //   ],
  // });

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
