import { uploadImageToImgBB } from '../../../../functions/upload.function';
import config from '../../../../../config';
import ModuleBuilder, { Module } from '../../../../types/module.class';
import { Generation } from '../../../../types/generation.class';

export default new ModuleBuilder('blend_second_image_scene', (module: Module) => {
  let timeoutId: NodeJS.Timeout;
  module.scene?.enter(async (ctx) => {
    await ctx.reply(config.second_photo, {
      parse_mode: 'Markdown'
    })
    timeoutId = setTimeout(async () => {
      await ctx.reply(config.waiting_time, { parse_mode: 'Markdown' });
      await ctx.scene.leave();
    }, 3 * 60 * 1000);
  })
  module.scene?.on('photo', async (ctx) => {
    const photo = ctx.message?.photo;
    const fileId = photo[photo.length - 1].file_id;
    const fileUrl = (await ctx.telegram.getFileLink(fileId)).href;
    const uploadResult = await uploadImageToImgBB(fileUrl, module.config.get('API_KEY'), module.logger);

    const user = await module.app.prisma.user.findUnique({
      where: { id: ctx.from.id }
    })
    if (!user) return
    module.logger.log([user.url, uploadResult.data.url])
    new Generation(module.app.prisma, module.logger, module.config, ctx, user, 'blend', {
      image_urls: [
        user.url,
        uploadResult.data.url
      ],
      process_mode: "fast",
    }, config.generationButtons);
    await ctx.scene.leave();
  })
  return module;
})