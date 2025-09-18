-- CreateEnum
CREATE TYPE "public"."TipoGasto" AS ENUM ('single', 'goal');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ciclo" (
    "id" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "valor_total" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Ciclo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Economia" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" BIGINT NOT NULL,
    "isPago" BOOLEAN NOT NULL,
    "data_pago" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cicloId" TEXT NOT NULL,

    CONSTRAINT "Economia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Gasto" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "valor" BIGINT NOT NULL,
    "tipo" "public"."TipoGasto" NOT NULL,
    "data_pago" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cicloId" TEXT NOT NULL,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RegistroGasto" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "valor" BIGINT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gastoId" TEXT NOT NULL,
    "semanaId" TEXT NOT NULL,

    CONSTRAINT "RegistroGasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Semana" (
    "id" TEXT NOT NULL,
    "qual_semana_ciclo" INTEGER NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "gastos" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cicloId" TEXT NOT NULL,

    CONSTRAINT "Semana_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Ciclo" ADD CONSTRAINT "Ciclo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Economia" ADD CONSTRAINT "Economia_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "public"."Ciclo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gasto" ADD CONSTRAINT "Gasto_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "public"."Ciclo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistroGasto" ADD CONSTRAINT "RegistroGasto_gastoId_fkey" FOREIGN KEY ("gastoId") REFERENCES "public"."Gasto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistroGasto" ADD CONSTRAINT "RegistroGasto_semanaId_fkey" FOREIGN KEY ("semanaId") REFERENCES "public"."Semana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Semana" ADD CONSTRAINT "Semana_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "public"."Ciclo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
