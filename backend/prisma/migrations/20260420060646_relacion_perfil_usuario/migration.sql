/*
  Warnings:

  - You are about to drop the column `usuarioCodigo` on the `Perfil` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[perfilId]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `perfilId` to the `Usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Perfil" DROP CONSTRAINT "Perfil_usuarioCodigo_fkey";

-- DropIndex
DROP INDEX "Perfil_usuarioCodigo_key";

-- AlterTable
ALTER TABLE "Perfil" DROP COLUMN "usuarioCodigo";

-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "perfilId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_perfilId_key" ON "Usuarios"("perfilId");

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
