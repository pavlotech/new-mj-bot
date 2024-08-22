/* import ModuleBuilder, { Module } from '../../../../../../types/module.class';

export default new ModuleBuilder('faq_question_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply('*Введите вопрос*', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Отменить', callback_data: 'cancel' }]
        ]
      },
      parse_mode: 'Markdown'
    });
  });
  module.scene?.on('text', async (ctx) => {
    const question = ctx.message.text;
    const faq = await module.app.prisma.fAQ.create({
      data: {
        question: question,
      }
    });
    await module.app.prisma.admin.update({
      where: { id: ctx.from.id },
      data: { faqId: faq.id }
    });
    await ctx.scene.enter('faq_answer_scene');
  });
  return module;
}); */