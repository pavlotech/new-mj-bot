/* import ModuleBuilder, { Module } from '../../../../../../types/module.class';

export default new ModuleBuilder('faq_answer_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply('*Введите ответ*', {
      parse_mode: 'Markdown'
    });
  });
  module.scene?.on('text', async (ctx) => {
    const answer = ctx.message.text;
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: ctx.from.id }
    });
    const faq = await module.app.prisma.fAQ.update({
      where: {
        id: admin?.faqId || ''
      },
      data: {
        answer: answer
      }
    });
    await ctx.reply(`Вопрос: ${faq.question}\nОтвет: ${answer}\nЗапись успешно сохранена.`,{
      parse_mode: 'Markdown'
    });
    await ctx.scene.leave();
  });
  return module;
}); */
