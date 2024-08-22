import { Generation } from '../../../..//types/generation.class';
import config from '../../../../../config';
import ModuleBuilder, { Module } from '../../../../types/module.class';

export default new ModuleBuilder('describe_get_text_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply(config.text, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Пропустить', callback_data: 'skip' }]
        ]
      },
      parse_mode: 'Markdown'
    })
  })
  module.scene?.action('skip', async (ctx) => {
    const user = await module.app.prisma.user.findUnique({
      where: { id: ctx.from.id }
    })
    if (!user) return
    
    await ctx.scene.leave()
    new Generation(module.app.prisma, module.logger, module.config, ctx, user, 'describe', {
      image_url: user.url,
      process_mode: "fast",
    }, config.generationButtons)
  });
  module.scene?.on('text', async (ctx) => {
    const user = await module.app.prisma.user.findUnique({
      where: { id: ctx.from.id }
    })
    if (!user) return
    const prompt = ctx.message.text
    const processedPrompt = await module.locale.translate(prompt, 'en');

    await ctx.scene.leave()
    new Generation(module.app.prisma, module.logger, module.config, ctx, user, 'imagine', {
      prompt: `${user.url} ${processedPrompt}`,
      process_mode: "fast",
    }, config.generationButtons);
  })
  return module;
})