import { uploadImageToImgBB } from '../../../../functions/upload.function';
import config from '../../../../../config';
import ModuleBuilder, { Module } from '../../../../types/module.class';

export default new ModuleBuilder('describe_get_image_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply(config.photo, {
      parse_mode: 'Markdown'
    })
  })
  module.scene?.on('photo', async (ctx) => {
    const photo = ctx.message?.photo;
    const fileId = photo[photo.length - 1].file_id;
    const fileUrl = (await ctx.telegram.getFileLink(fileId)).href;
    const uploadResult = await uploadImageToImgBB(fileUrl, module.config.get('API_KEY'), module.logger);
    
    await module.app.prisma.user.update({
      where: { id: ctx.from.id },
      data: { url: uploadResult.data.url }
    })
    await ctx.scene.enter('describe_get_text_scene')
  })
  return module;
})