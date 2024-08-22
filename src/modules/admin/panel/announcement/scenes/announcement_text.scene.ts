import ModuleBuilder, { Module } from '../../../../../types/module.class';

export default new ModuleBuilder('announcement_text_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply('Введите текст объявления', {
      parse_mode: 'Markdown'
    });
  });
  module.scene?.on('text', async (ctx) => {
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: ctx.from.id }
    });

    if (admin?.announcementId) {
      await module.app.prisma.announcement.update({
        where: { id: admin.announcementId },
        data: { text: ctx.message.text }
      });
      await ctx.scene.enter('announcement_media_scene');
    } else {
      await ctx.reply('Произошла ошибка. Пожалуйста, начните сначала.');
      await ctx.scene.leave();
    }
  });
  return module;
});