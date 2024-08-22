-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "registry" BIGINT NOT NULL DEFAULT 0,
    "subscribe" INTEGER NOT NULL DEFAULT 0,
    "prompt" TEXT NOT NULL DEFAULT '',
    "ratio" TEXT NOT NULL DEFAULT '1:1',
    "lastPay" BIGINT NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ban" BOOLEAN NOT NULL DEFAULT false,
    "banDate" BIGINT NOT NULL DEFAULT 0,
    "url" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_User" ("ban", "banDate", "createdAt", "id", "lastPay", "name", "prompt", "ratio", "registry", "subscribe") SELECT "ban", "banDate", "createdAt", "id", "lastPay", "name", "prompt", "ratio", "registry", "subscribe" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
