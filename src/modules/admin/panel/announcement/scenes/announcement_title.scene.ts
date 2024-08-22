import ModuleBuilder, { Module } from '../../../../../types/module.class';

export default new ModuleBuilder('announcement_title_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply('Введите название объявления', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Отменить', callback_data: 'cancel' }]
        ]
      },
      parse_mode: 'Markdown'
    });
  });
  module.scene?.on('text', async (ctx) => {
    const announcement = await module.app.prisma.announcement.create({ data: { title: ctx.message.text } });
    await module.app.prisma.admin.update({
      where: { id: ctx.from.id },
      data: { announcementId: announcement.id }
    });
    await ctx.scene.enter('announcement_text_scene');
  });
  return module;
});