-- AlterTable
ALTER TABLE "Bus" ADD COLUMN     "driverContact" TEXT,
ADD COLUMN     "driverName" TEXT;

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "dayType" TEXT NOT NULL DEFAULT 'WEEKDAY';
