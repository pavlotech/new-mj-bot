/* import ModuleBuilder, { Module } from '../../../../types/module.class';

export default new ModuleBuilder('edit', (module: Module) => {
  module.bot.action('edit', async (ctx) => {
    await ctx.editMessageText('*Выберите, что вы хотите редактировать*', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Часто задаваемые вопросы', callback_data: 'edit_faq_list' }],
          [{ text: 'Промт', callback_data: 'edit_prompt' }],
          [{ text: 'Тарифы', callback_data: 'edit_tariff_list' }],
          [{ text: 'Назад', callback_data: 'back_to_panel' }],
        ]
      },
      parse_mode: 'Markdown'
    });
  });
  module.bot.action('edit_faq_list', async (ctx) => {
    const faqs = await module.app.prisma.fAQ.findMany();
    const keyboard = faqs.map(faq => [{
      text: faq.question,
      callback_data: `edit_faq_${faq.id}`
    }]);

    keyboard.push([{ text: 'Создать', callback_data: 'create_faq' }]);
    keyboard.push([{ text: 'Назад', callback_data: 'edit' }]);

    await ctx.editMessageText('*Выберите вопрос для редактирования или создайте новый*', {
      reply_markup: {
        inline_keyboard: keyboard
      },
      parse_mode: 'Markdown'
    });
  });

  module.bot.action('edit_prompt', async (ctx) => {
    await ctx.scene.enter('create_prompt_scene')
  });
  module.bot.action('edit_tariff_list', async (ctx) => {
    const tariffs = await module.app.prisma.tariff.findMany();
    const keyboard = tariffs.map(tariff => [{
      text: tariff.name,
      callback_data: `edit_tariff_${tariff.id}`
    }]);

    keyboard.push([{ text: 'Создать', callback_data: 'create_tariff' }]);
    keyboard.push([{ text: 'Назад', callback_data: 'edit' }]);

    await ctx.editMessageText('*Выберите тариф для редактирования или создайте новый*', {
      reply_markup: {
        inline_keyboard: keyboard
      },
      parse_mode: 'Markdown'
    });
  });

  module.bot.action('create_tariff', async (ctx) => {
    await ctx.scene.enter('tariff_name_scene')
  })
  module.bot.action('create_faq', async (ctx) => {
    await ctx.scene.enter('faq_question_scene')
  })
  module.bot.action(/^edit_faq_(.+)$/, async (ctx) => {
    const faqId = ctx.match[1];
    const faq = await module.app.prisma.fAQ.findUnique({ where: { id: faqId } });
    if (!faq) return;

    await ctx.editMessageText(`Вопрос: ${faq.question}\nОтвет: ${faq.answer}`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Удалить', callback_data: `delete_faq_${faqId}` }],
          [{ text: 'Назад', callback_data: 'edit_faq_list' }],
        ]
      },
      parse_mode: 'Markdown'
    });
  });
  module.bot.action(/^edit_tariff_(.+)$/, async (ctx) => {
    const tariffId = ctx.match[1];
    const tariff = await module.app.prisma.tariff.findUnique({ where: { id: tariffId } });
    if (!tariff) return;

    await ctx.editMessageText(`*Название: ${tariff.name}\nОписание: ${tariff.description}\nЦена: ${tariff.price}*`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Удалить', callback_data: `delete_tariff_${tariffId}` }],
          [{ text: 'Назад', callback_data: 'edit_tariff_list' }],
        ]
      },
      parse_mode: 'Markdown'
    });
  });
  module.bot.action(/^delete_faq_(.+)$/, async (ctx) => {
    const faqId = ctx.match[1];

    const faq = await module.app.prisma.fAQ.delete({ where: { id: faqId } });
    await ctx.editMessageText(`*Вопрос: ${faq.question} удален*`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Назад', callback_data: 'edit_faq_list' }],
        ],
      },
      parse_mode: 'Markdown'
    });
  });
  module.bot.action(/^delete_tariff_(.+)$/, async (ctx) => {
    const tariffId = ctx.match[1];
    const tariff = await module.app.prisma.tariff.delete({ where: { id: tariffId } });

    await ctx.editMessageText(`*Тариф: ${tariff.name} удален*`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Назад', callback_data: 'edit_tariff_list' }],
        ],
      },
      parse_mode: 'Markdown'
    });
  });
  return module;
}); */