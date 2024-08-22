import ModuleBuilder, { Module } from '../../../../../types/module.class';

export default new ModuleBuilder('announcement_media_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply('Прикрепите медиа файл (фото, видео, gif или документ) или нажмите "Пропустить" для пропуска', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Пропустить', callback_data: 'skip_media' }]
        ]
      },
      parse_mode: 'Markdown'
    });
  });
  module.scene?.on('message', async (ctx) => {
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: ctx.from.id }
    });

    const message = ctx.message;
    if (admin?.announcementId) {
      let fileId = '';

      if ('photo' in message) {
        fileId = message.photo[message.photo.length - 1].file_id;
      } else if ('video' in message) {
        fileId = message.video.file_id;
      } else if ('document' in message) {
        const mimeType = message.document.mime_type;
        const fileExtension = mimeType?.split('/').pop();
        if (['jpeg', 'png', 'mov', 'mp4', 'gif'].includes(fileExtension || '')) {
          fileId = message.document.file_id;
        }
      }
      if (fileId) {
        await module.app.prisma.announcement.update({
          where: { id: admin.announcementId },
          data: { media: fileId }
        });
        await ctx.scene.enter('announcement_button_scene');
      } else {
        await ctx.reply('Пожалуйста, прикрепите фото, видео, gif или документ (jpeg, png, mov, mp4) или нажмите "Пропустить" для пропуска', {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Пропустить', callback_data: 'skip_media' }]
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
  module.scene?.action('skip_media', async (ctx) => {
    await ctx.scene.enter('announcement_button_scene');
  });
  return module;
});