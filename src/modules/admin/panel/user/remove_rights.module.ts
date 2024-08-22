import ModuleBuilder, { Module } from '../../../../types/module.class';

export default new ModuleBuilder('panel_user_remove_rights', (module: Module) => {
  module.bot.action(/^remove_rights_(\d+)$/, async (ctx) => {
    const userId = Number(ctx.match[1]);
    const user = await module.app.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    const existingAdmin = await module.app.prisma.admin.findUnique({
      where: { id: userId }
    });

    if (!existingAdmin) {
      await ctx.reply('Пользователь не является администратором', {
        parse_mode: 'Markdown'
      });
      return;
    }

    await module.app.prisma.admin.delete({
      where: { id: userId }
    });

    const admins = await module.app.prisma.admin.findMany({ where: { logs: true } });
    const message = `[${user.name}](tg://user?id=${userId}) (ID: \`${userId}\`) лишен прав администратора`;
    admins.forEach(async (admin) => {
      await ctx.telegram.sendMessage(Number(admin.id), message, {
        parse_mode: 'Markdown'
      });
    });
  });
  return module;
})