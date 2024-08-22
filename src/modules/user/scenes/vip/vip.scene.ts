import config from '../../../../../config';
import ModuleBuilder, { Module } from '../../../../types/module.class';

export default new ModuleBuilder('vip_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply(`Введите E-Mail`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: `Отменить`, callback_data: 'cancel' }]
        ]
      },
      parse_mode: 'Markdown'
    })
  })
  module.scene?.on('text', async (ctx) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = ctx.message.text;

    if (!emailRegex.test(email)) {
      await ctx.reply(`Это не E-Mail`, { parse_mode: 'Markdown' })
      return ctx.scene.reenter()
    }
    let numPay = Math.floor(Date.now() / 1000)
    const Amount = config.vip.price * 100;

    module.app.tinkoff.createInvoice({
      Amount: Amount,
      OrderId: `mj_01_${numPay}_${ctx.from.id}`,
      Description: config.vip.description,
    }, {
      Email: email,
      Taxation: "usn_income",
      Items: [
        {
          Name: config.vip.invoiceName,
          Quantity: 1,
          Price: Amount,
          Amount: Amount,
          Tax: "none",
        },
      ]
    }).then(async (invoice: any) => {
      const messageText = `
После оплаты нажмите на кнопку 'Я оплатил подписку ✅'.
❗️ВАЖНО: Оплачивайте по этой ссылке только один раз
Если вы оплатили, но пишет, что оплата не найдена, просто попробуйте через 10-30 секунд ⏳
Ссылка на оплату: ${invoice.PaymentURL}
      `;

      const editMessage = await ctx.reply(messageText, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Оплатить подписку 💰", url: invoice.PaymentURL }],
            [{ text: "Я оплатил подписку ✅", callback_data: 'i_paid' }]
          ]
        },
      });
      ctx.scene.session.state.editMessageId = editMessage.message_id
      ctx.scene.session.state.paymentId = invoice.PaymentId
      ctx.scene.session.state.paymentStatuse = true
    })
  })
  module.scene?.action('i_paid', async (ctx) => {
    const editMessageId = ctx.scene.session.state.editMessageId
    const paymentId = ctx.scene.session.state.paymentId
    const paymentStatus = ctx.scene.session.state.paymentStatuse

    module.logger.log(editMessageId, paymentId, paymentStatus)

    if (editMessageId && paymentId && paymentStatus) {
      await ctx.telegram.editMessageText(ctx.chat?.id, editMessageId, '', config.vip.paymentCheck, {
        parse_mode: 'Markdown'
      });

      const invoice: any = await module.app.tinkoff.statusInvoice(paymentId);

      if (invoice.Status === 'CONFIRMED') {
        const user = await module.app.prisma.user.findUnique({
          where: { id: ctx.from.id }
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
        await ctx.reply('Спасибо за подписку!', { parse_mode: 'Markdown' });
        module.logger.info(`${ctx.from.id} - https://t.me/${ctx.from?.username} bought a subscription`);
      } else {
        await ctx.reply('<b>Платёж не прошёл</b>', { parse_mode: 'HTML' });
        module.logger.info(`${ctx.from.id} - https://t.me/${ctx.from?.username} payment failed`);
      }
    }
    await ctx.scene.leave();
  })
  return module;
})