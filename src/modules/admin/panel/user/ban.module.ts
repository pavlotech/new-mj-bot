import ModuleBuilder, { Module } from '../../../../types/module.class';

export default new ModuleBuilder('panel_user_ban', (module: Module) => {
  module.bot.action(/^ban_(\d+)$/, async (ctx) => {
    const userId = Number(ctx.match[1]);
    const user = await module.app.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) return;
    if (user.ban) {
      await ctx.reply('Пользователь уже заблокирован', {
        parse_mode: 'Markdown'
      });
      return;
    }
    await module.app.prisma.user.update({
      where: { id: userId },
      data: { ban: true }
    });

    const admins = await module.app.prisma.admin.findMany({ where: { logs: true } });
    const message = `[${user.name}](tg://user?id=${userId}) (ID: \`${userId}\`) был заблокирован`;
    admins.forEach(async (admin) => {
      await ctx.telegram.sendMessage(Number(admin.id), message, {
        parse_mode: 'Markdown'
      });
    });
  });
  return module;
})