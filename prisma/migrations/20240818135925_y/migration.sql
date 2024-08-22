-- CreateTable
CREATE TABLE "Admin" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "logs" BOOLEAN NOT NULL DEFAULT true,
    "announcementId" TEXT DEFAULT '',
    "faqId" TEXT DEFAULT ''
);

-- CreateTable
CREATE TABLE "User" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "registry" BIGINT NOT NULL DEFAULT 0,
    "subscribe" INTEGER NOT NULL DEFAULT 0,
    "prompt" TEXT NOT NULL DEFAULT '',
    "ratio" TEXT NOT NULL DEFAULT '1:1',
    "lastPay" BIGINT NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ban" BOOLEAN NOT NULL DEFAULT false,
    "banDate" BIGINT NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user" BIGINT NOT NULL,
    "date" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT '',
    "media" TEXT DEFAULT '',
    "text" TEXT NOT NULL DEFAULT '',
    "button" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL DEFAULT '',
    "answer" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_id_key" ON "Admin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_key" ON "Task"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Announcement_id_key" ON "Announcement"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FAQ_id_key" ON "FAQ"("id");
