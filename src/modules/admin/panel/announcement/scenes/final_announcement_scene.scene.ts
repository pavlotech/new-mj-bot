import ModuleBuilder, { Module } from '../../../../../types/module.class';

export default new ModuleBuilder('final_announcement_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: ctx.from?.id }
    });

    if (admin?.announcementId) {
      const announcement = await module.app.prisma.announcement.findUnique({
        where: { id: admin.announcementId }
      });

      if (announcement) {
        const message = `${announcement.title}\n\n${announcement.text}`;
        const buttons = announcement.button ? JSON.parse(announcement.button) : [];
        const inlineKeyboard = buttons.map((button: { text: string, url: string }) => [{ text: button.text, url: button.url }]);

        const extra: any = {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: inlineKeyboard }
        };

        if (announcement.media) {
          const fileUrl = (await ctx.telegram.getFileLink(announcement.media)).href;
          const fileExtension = fileUrl.split('.').pop()?.toLowerCase();

          switch (fileExtension) {
            case 'jpeg':
            case 'jpg':
            case 'png':
              await ctx.replyWithPhoto(announcement.media, { caption: message, ...extra });
              break;
            case 'mp4':
            case 'gif':
              await ctx.replyWithVideo(announcement.media, { caption: message, ...extra });
              break;
            case 'mov':
              await ctx.replyWithDocument(announcement.media, { caption: message, ...extra });
              break;
            default:
              await ctx.reply(message, extra);
              break;
          }
        } else {
          await ctx.reply(message, extra);
        }

        await ctx.reply('Выберите действие', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Сохранить', callback_data: 'save_announcement' },
                { text: 'Удалить', callback_data: 'delete_announcement' }
              ],
              [
                { text: 'Отправить', callback_data: 'send_announcement' }
              ]
            ]
          },
          parse_mode: 'Markdown'
        });
      }
    } else {
      await ctx.reply('Произошла ошибка. Попробуйте еще раз', {
        parse_mode: 'Markdown'
      });
      await ctx.scene.leave();
    }
  });

  module.scene?.action('delete_announcement', async (ctx) => {
    const adminId = ctx.from.id;
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (admin?.announcementId) {
      await module.app.prisma.announcement.delete({ where: { id: admin.announcementId } });
      await ctx.editMessageText('Объявление удалено', {
        parse_mode: 'Markdown'
      });
      await module.app.prisma.admin.update({
        where: { id: adminId },
        data: { announcementId: null }
      });
      await new Promise((resolve) => setTimeout(resolve, 250));
      await ctx.deleteMessage()
      await ctx.scene.leave();
    } else {
      await ctx.reply('Произошла ошибка. Попробуйте еще раз', { parse_mode: 'Markdown' });
      await ctx.scene.leave();
    }
  });

  module.scene?.action('save_announcement', async (ctx) => {
    await ctx.editMessageText('Объявление сохранено', { parse_mode: 'Markdown' });
    await ctx.scene.leave();
  });

  module.scene?.action('send_announcement', async (ctx) => {
    const adminId = ctx.from.id;
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (admin?.announcementId) {
      const announcement = await module.app.prisma.announcement.findUnique({
        where: { id: admin.announcementId }
      });

      if (announcement) {
        const buttons = announcement.button ? JSON.parse(announcement.button) : [];
        const inlineKeyboard = buttons.map((button: { text: string, url: string }) => [{ text: button.text, url: button.url }]);
        const extra: any = {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: inlineKeyboard }
        };

        const users = await module.app.prisma.user.findMany();
        let successCount = 0;
        let errorCount = 0;
        const startTime = Date.now();

        await Promise.all(users.map(async (user) => {
          try {
            if (announcement.media) {
              const fileUrl = (await ctx.telegram.getFileLink(announcement.media)).href;
              const fileExtension = fileUrl.split('.').pop()?.toLowerCase();

              switch (fileExtension) {
                case 'jpeg':
                case 'jpg':
                case 'png':
                  await ctx.telegram.sendPhoto(Number(user.id), announcement.media, { caption: announcement.text, ...extra });
                  break;
                case 'mp4':
                case 'gif':
                  await ctx.telegram.sendVideo(Number(user.id), announcement.media, { caption: announcement.text, ...extra });
                  break;
                case 'mov':
                  await ctx.telegram.sendDocument(Number(user.id), announcement.media, { caption: announcement.text, ...extra });
                  break;
                default:
                  await ctx.telegram.sendMessage(Number(user.id), announcement.text, extra);
                  break;
              }
            } else {
              await ctx.telegram.sendMessage(Number(user.id), announcement.text, extra);
            }
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }));

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        const admins = await module.app.prisma.admin.findMany({ where: { logs: true } });
        const report = `Отчет по отправке объявления "${announcement.title}":\n\nОтправлено: ${successCount}\nОшибок: ${errorCount}\nВремя: ${duration} секунд`;

        admins.forEach(async (admin) => {
          await ctx.telegram.sendMessage(Number(admin.id), report, { parse_mode: 'Markdown' });
        });

        await ctx.reply('Объявление отправлено', {
          parse_mode: 'Markdown'
        });
        await module.app.prisma.admin.update({
          where: { id: adminId },
          data: { announcementId: null }
        });
        await ctx.scene.leave();
      }
    } else {
      await ctx.reply('Произошла ошибка. Попробуйте еще раз', {
        parse_mode: 'Markdown'
      });
      await ctx.scene.leave();
    }
  });
  return module;
});