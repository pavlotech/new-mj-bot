import ModuleBuilder, { Module } from '../../../../types/module.class';

export default new ModuleBuilder('panel_user_give_subscription', (module: Module) => {
  module.bot.action(/^give_subscription_(\d+)$/, async (ctx) => {
    const userId = Number(ctx.match[1]);
    const user = await module.app.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) return;

    await ctx.reply(`Выберите количество запросов для выдачи пользователю [${user.name}](tg://user?id=${userId}):`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '1', callback_data: `give_subscription_${userId}_1` },
            { text: '5', callback_data: `give_subscription_${userId}_5` },
            { text: '10', callback_data: `give_subscription_${userId}_10` },
            { text: '30', callback_data: `give_subscription_${userId}_30` }
          ],
          [
            { text: '50', callback_data: `give_subscription_${userId}_50` },
            { text: '100', callback_data: `give_subscription_${userId}_100` },
            { text: '200', callback_data: `give_subscription_${userId}_200` },
            { text: '500', callback_data: `give_subscription_${userId}_500` }
          ],
          [
            { text: '1000', callback_data: `give_subscription_${userId}_1000` },
            { text: '2000', callback_data: `give_subscription_${userId}_2000` },
            { text: '5000', callback_data: `give_subscription_${userId}_5000` },
            { text: '10000', callback_data: `give_subscription_${userId}_10000` }
          ],
        ]
      },
      parse_mode: 'Markdown'
    });
  });

  module.bot.action(/^give_subscription_(\d+)_(\d+)$/, async (ctx) => {
    const userId = Number(ctx.match[1]);
    const amount = Number(ctx.match[2]);

    const user = await module.app.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) return;

    await module.app.prisma.user.update({
      where: { id: userId },
      data: { subscribe: user.subscribe + amount }
    });

    const admins = await module.app.prisma.admin.findMany({ where: { logs: true } });
    const message = `Пользователю [${user.name}](tg://user?id=${userId}) (ID: \`${userId}\`) выданы запросы в количестве ${amount}`;
    admins.forEach(async (admin) => {
      await ctx.telegram.sendMessage(Number(admin.id), message, {
        parse_mode: 'Markdown'
      });
    });
  });
  return module;
});