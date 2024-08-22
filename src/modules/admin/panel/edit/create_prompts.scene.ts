/* import ModuleBuilder, { Module } from '../../../../types/module.class';

export default new ModuleBuilder('create_prompt_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply('*Введите текст промта*', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Отменить', callback_data: 'cancel' }]
        ]
      },
      parse_mode: 'Markdown'
    });
  });
  module.scene?.on('text', async (ctx) => {
    const text = ctx.message.text;

    const newPrompt = await module.app.prisma.prompt.create({
      data: { text }
    });
    await module.app.prisma.prompt.deleteMany({
      where: {
        id: { not: newPrompt.id }
      }
    });
    await ctx.reply(`Промт: ${text}\nЗапись успешно сохранена`, {
      parse_mode: 'Markdown'
    });
    await ctx.scene.leave();
  });
  return module;
}); */