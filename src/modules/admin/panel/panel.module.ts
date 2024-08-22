import ModuleBuilder, { Module } from '../../../types/module.class';

export default new ModuleBuilder('panel', (module: Module) => {
  module.bot.command('panel', async (ctx) => {
    const user = await module.app.prisma.user.findUnique({
      where: { id: ctx.from.id }
    });
    if (!user || user.ban) return;
    
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: ctx.from.id }
    });
    if (!admin) {
      module.logger.warn(`${ctx.from.id} try using the admin command`);
      const admins = await module.app.prisma.admin.findMany({
        where: { logs: true }
      });
      const message = `[${ctx.from.username || ctx.from.first_name}](tg://user?id=${ctx.from.id}) (ID: \`${ctx.from.id}\`) попытался использовать команду администратора`;
      admins.forEach(async (admin) => {
        await ctx.telegram.sendMessage(Number(admin.id), message, {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Заблокировать', callback_data: `ban_${ctx.from.id}` }]
            ]
          },
          parse_mode: 'Markdown'
        });
      });
      return;
    }
    await ctx.reply('Вы вошли в панель администратора', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Список пользователей', callback_data: 'users_list_1' }],
          [{ text: 'Создать обьявление', callback_data: 'announcement' }],
          [{ text: 'Список обьявлений', callback_data: 'list_announcements' }],
          [{ text: 'Редактирование по ID', callback_data: 'edit' }],
        ]
      },
      parse_mode: 'Markdown'
    });
  });
  module.bot.action('edit', async (ctx) => {
    await ctx.scene.enter('get_user_data_scene')
  });
  module.bot.action('back_to_panel', async (ctx) => {
    await ctx.editMessageText('Вы вошли в панель администратора', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Список пользователей', callback_data: 'users_list_1' }],
          [{ text: 'Создать обьявление', callback_data: 'announcement' }],
          [{ text: 'Список обьявлений', callback_data: 'list_announcements' }],
          [{ text: 'Редактирование по ID', callback_data: 'edit' }],
        ]
      },
      parse_mode: 'Markdown'
    });
  });
  return module;
});