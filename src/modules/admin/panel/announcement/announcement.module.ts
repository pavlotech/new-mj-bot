import ModuleBuilder, { Module } from '../../../../types/module.class';

export default new ModuleBuilder('announcement', (module: Module) => {
  module.bot.action('announcement', async (ctx) => {
    await ctx.scene.enter('announcement_title_scene');
  });

  module.bot.action('list_announcements', async (ctx) => {
    const announcements = await module.app.prisma.announcement.findMany();

    const keyboard = announcements.map((announcement) => [
      { text: announcement.title || 'Без заголовка', callback_data: `view_announcement_${announcement.id}` }
    ]);
    keyboard.push([{ text: 'Создать', callback_data: 'announcement' }]);
    keyboard.push([{ text: 'Назад', callback_data: 'back_to_panel' }]);

    await ctx.editMessageText('Список объявлений', {
      reply_markup: {
        inline_keyboard: keyboard
      },
      parse_mode: 'Markdown'
    });
  });

  module.bot.action(/view_announcement_/, async (ctx) => {
    const id = ctx.match.input.split('_').pop();
    const announcement = await module.app.prisma.announcement.findUnique({
      where: { id }
    });

    if (announcement) {
      const message = `${announcement.title}\n\n${announcement.text}`;
      const extra: any = {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Удалить', callback_data: `delete_announcement_${id}` }],
            [{ text: 'Отправить', callback_data: `send_announcement_${id}` }]
          ]
        }
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
    }
  });
  module.bot.action(/delete_announcement_/, async (ctx) => {
    const id = ctx.match.input.split('_').pop();
    await module.app.prisma.announcement.delete({ where: { id } });
    await ctx.editMessageText('Объявление удалено', {
      parse_mode: 'Markdown'
    });
    await new Promise((resolve) => setTimeout(resolve, 250));
    await ctx.deleteMessage()
  });
  module.bot.action(/send_announcement_/, async (ctx) => {
    const id = ctx.match.input.split('_').pop();
    const announcement = await module.app.prisma.announcement.findUnique({
      where: { id }
    });

    if (announcement) {
      const users = await module.app.prisma.user.findMany();
      let successCount = 0;
      let errorCount = 0;
      const startTime = Date.now();

      await Promise.all(users.map(async (user) => {
        try {
          const fileUrl = (await ctx.telegram.getFileLink(announcement.media || '')).href;
          const fileExtension = fileUrl.split('.').pop()?.toLowerCase();

          if (announcement.media) {
            switch (fileExtension) {
              case 'jpeg':
              case 'jpg':
                await ctx.telegram.sendPhoto(Number(user.id), announcement.media, { caption: announcement.text });
                break;
              case 'mp4':
              case 'gif':
                await ctx.telegram.sendVideo(Number(user.id), announcement.media, { caption: announcement.text });
                break;
              case 'png':
              case 'mov':
                await ctx.telegram.sendDocument(Number(user.id), announcement.media, { caption: announcement.text });
                break;
              default:
                await ctx.telegram.sendMessage(Number(user.id), announcement.text);
                break;
            }
          } else {
            await ctx.telegram.sendMessage(Number(user.id), announcement.text);
          }
          successCount++;
        } catch (error) {
          module.logger.error(error)
          errorCount++;
        }
      }));

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      const admins = await module.app.prisma.admin.findMany({ where: { logs: true } });
      const report = `Отчет по отправке объявления "${announcement.title}":\n\nОтправлено: ${successCount}\nОшибок: ${errorCount}\nВремя: ${duration} секунд`;

      admins.forEach(async (admin) => {
        await ctx.telegram.sendMessage(Number(admin.id), report);
      });
    }
  });
  return module;
});