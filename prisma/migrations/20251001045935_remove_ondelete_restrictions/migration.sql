-- DropForeignKey
ALTER TABLE "public"."Ciclo" DROP CONSTRAINT "Ciclo_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Economia" DROP CONSTRAINT "Economia_cicloId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Gasto" DROP CONSTRAINT "Gasto_cicloId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RegistroGasto" DROP CONSTRAINT "RegistroGasto_gastoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RegistroGasto" DROP CONSTRAINT "RegistroGasto_semanaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Semana" DROP CONSTRAINT "Semana_cicloId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Ciclo" ADD CONSTRAINT "Ciclo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Economia" ADD CONSTRAINT "Economia_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "public"."Ciclo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gasto" ADD CONSTRAINT "Gasto_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "public"."Ciclo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistroGasto" ADD CONSTRAINT "RegistroGasto_gastoId_fkey" FOREIGN KEY ("gastoId") REFERENCES "public"."Gasto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistroGasto" ADD CONSTRAINT "RegistroGasto_semanaId_fkey" FOREIGN KEY ("semanaId") REFERENCES "public"."Semana"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Semana" ADD CONSTRAINT "Semana_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "public"."Ciclo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
