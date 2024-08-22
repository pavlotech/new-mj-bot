import ModuleBuilder, { Module } from '../../../../../types/module.class';

export default new ModuleBuilder('announcement_button_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply('Введите кнопки в формате [текст кнопки](ссылка) или нажмите "Пропустить" для пропуска', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Пропустить', callback_data: 'skip_button' }]
        ]
      },
      parse_mode: 'Markdown'
    });
  });
  module.scene?.on('text', async (ctx) => {
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: ctx.from.id }
    });

    if (admin?.announcementId) {
      const buttons = ctx.message.text.match(/\[([^\]]+)\]\(([^)]+)\)/g)?.slice(0, 20).map(button => {
        const match = button.match(/\[([^\]]+)\]\(([^)]+)\)/);
        return match ? { text: match[1], url: match[2] } : null;
      }).filter(Boolean);

      const buttonData = buttons ? JSON.stringify(buttons) : '';
      await module.app.prisma.announcement.update({
        where: { id: admin.announcementId },
        data: { button: buttonData }
      });
      await ctx.scene.enter('final_announcement_scene');
    } else {
      await ctx.reply('Произошла ошибка. Пожалуйста, начните сначала.', { parse_mode: 'Markdown' });
      await ctx.scene.leave();
    }
  });
  module.scene?.action('skip_button', async (ctx) => {
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: ctx.from.id }
    });

    if (admin?.announcementId) {
      await module.app.prisma.announcement.update({
        where: { id: admin.announcementId },
        data: { button: '' }
      });
      await ctx.scene.enter('final_announcement_scene');
    } else {
      await ctx.reply('Произошла ошибка. Пожалуйста, начните сначала.', { parse_mode: 'Markdown' });
      await ctx.scene.leave();
    }
  });
  return module;
});