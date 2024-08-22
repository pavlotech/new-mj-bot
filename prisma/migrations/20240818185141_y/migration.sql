-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "logs" BOOLEAN NOT NULL DEFAULT true,
    "announcementId" TEXT DEFAULT '',
    "faqId" TEXT DEFAULT '',
    "userId" BIGINT NOT NULL DEFAULT 0
);
INSERT INTO "new_Admin" ("announcementId", "faqId", "id", "logs") SELECT "announcementId", "faqId", "id", "logs" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_id_key" ON "Admin"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
