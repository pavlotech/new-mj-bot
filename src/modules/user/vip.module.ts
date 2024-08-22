import config from '../../../config';
import ModuleBuilder, { Module } from '../../types/module.class';

export default new ModuleBuilder('vip', (module: Module) => {
  module.bot.command('vip', async (ctx) => {
    const user = await module.app.prisma.user.findUnique({
      where: { id: ctx.from.id }
    })
    if (!user || user.ban) return;
    await ctx.reply(`
Подписка дает 50 обработок изображений в сумме. 

Стоимость: 490 руб

Чтобы купить, выберите метод оплаты ниже`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Карта/СПБ", callback_data: 't-bank' }],
          [{ text: "⭐ Telegram stars", callback_data: 'stars' }],
        ]
      },
      parse_mode: 'Markdown'
    })

    const username = ctx.from.username;
    const firstName = ctx.from.first_name;
    const lastName = ctx.from.last_name;
    await module.app.prisma.user.update({
      where: {
        id: ctx.from.id
      },
      data: {
        name: username ? `${username}` : `${firstName}${lastName ? ` ${lastName}` : ''}`,
      }
    })
  })
  module.bot.action('t-bank', async (ctx) => {
    ctx.scene.enter('vip_scene')
  })
  module.bot.action('stars', async (ctx) => {
    await ctx.replyWithInvoice(config.vip.getInvoice(ctx.from?.id || 0))
  })
  module.bot.on('pre_checkout_query', async (ctx) => {
    return ctx.answerPreCheckoutQuery(true)
  })
  module.bot.on('successful_payment', async (ctx) => {
    const user = await module.app.prisma.user.findUnique({
      where: { id: ctx.from.id }
    })
    await ctx.reply(config.vip.successfulPayment, {
      parse_mode: 'Markdown'
    })
    if (!user) return
    await module.app.prisma.user.update({
      where: {
        id: ctx.from.id
      },
      data: {
        subscribe: user.subscribe + config.vip.quantity,
        lastPay: Date.now()
      }
    })
  })
  return module;
})