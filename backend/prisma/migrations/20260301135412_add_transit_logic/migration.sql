/*
  Warnings:

  - The `status` column on the `Bus` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Bus" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'INACTIVE';

-- DropEnum
DROP TYPE "BusStatus";

-- CreateTable
CREATE TABLE "BusStop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BusStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "departureTime" TEXT NOT NULL,
    "busId" INTEGER NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "destId" INTEGER NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusStop_name_key" ON "BusStop"("name");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "BusStop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_destId_fkey" FOREIGN KEY ("destId") REFERENCES "BusStop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
