import ModuleBuilder, { Module } from '../../types/module.class';

export default new ModuleBuilder('profile', (module: Module) => {
  module.bot.command('my_profile', async (ctx) => {
    const user = await module.app.prisma.user.findUnique({
      where: {
        id: ctx.from.id
      }
    })
    if (!user || user.ban) return;
    await ctx.reply(`
*ID:* \`${ctx.from.id}\`
Остаток запросов: ${user.subscribe}

Пополнить баланс - /vip`, { parse_mode: 'Markdown' }
    )

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
  return module;
})