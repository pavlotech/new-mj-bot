import ModuleBuilder, { Module } from '../../../../types/module.class';

export default new ModuleBuilder('panel_user_list', (module: Module) => {
  module.bot.action(/^users_list(?:_(\d+))?$/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    const itemsPerRow = 2;
    const chunkSize = 30;

    const [users, totalUsers, bannedUsers] = await Promise.all([
      module.app.prisma.user.findMany({
        skip: (page - 1) * chunkSize,
        take: chunkSize
      }),
      module.app.prisma.user.count(),
      module.app.prisma.user.count({ where: { ban: true } }),
    ]);

    const totalPages = Math.ceil(totalUsers / chunkSize);
    const message = `Список пользователей\n- Колличество: ${totalUsers}\n- Заблокировано: ${bannedUsers}`;

    const keyboard = [];
    for (let i = 0; i < users.length; i += itemsPerRow) {
      const row = users.slice(i, i + itemsPerRow).map(user => ({
        text: `${user.name} | ${user.id} | ${user.subscribe}${user.ban ? ' | ❌' : ''}`,
        callback_data: `edit_${user.id}`
      }));
      keyboard.push(row);
    }

    const navButtons = [
      ...(page > 1 ? [{ text: '⬅️', callback_data: `users_list_${page - 1}` }] : []),
      ...(page < totalPages ? [{ text: '➡️', callback_data: `users_list_${page + 1}` }] : [])
    ];

    if (navButtons.length > 0) keyboard.push(navButtons);
    keyboard.push([{ text: 'Назад', callback_data: 'back_to_panel' }]);

    await ctx.editMessageText(message, {
      reply_markup: { inline_keyboard: keyboard },
      parse_mode: 'Markdown'
    });
  });
  return module;
});