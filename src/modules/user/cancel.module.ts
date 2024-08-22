import ModuleBuilder, { Module } from '../../types/module.class';

export default new ModuleBuilder('cancel', (module: Module) => {
  module.bot.action('cancel', async (ctx) => {
    await ctx.editMessageText('Отменено', {
      parse_mode: 'Markdown'
    });
    await new Promise((resolve) => setTimeout(resolve, 250));
    await ctx.deleteMessage()
    await ctx.scene.leave();
  });
  return module;
})