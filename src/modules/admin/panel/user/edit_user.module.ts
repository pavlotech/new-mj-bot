import ModuleBuilder, { Module } from '../../../../types/module.class';

export default new ModuleBuilder('panel_user_edit', (module: Module) => {
  module.bot.action(/^edit_(\d+)$/, async (ctx) => {
    const userId = Number(ctx.match[1]);
    const user = await module.app.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    const message = `Редактирование пользователя ${user.name} [ID: ${user.id}]\n- Запросов: ${user.subscribe}\n- Заблокирован: ${user.ban ? 'Да' : 'Нет'}`;
    const keyboard = [
      [
        { text: 'Выдать права', callback_data: `give_rights_${user.id}` },
        { text: 'Забрать права', callback_data: `remove_rights_${user.id}` }
      ],
      [ 
        { text: 'Разблокировать', callback_data: `unban_${user.id}` },
        { text: 'Заблокировать', callback_data: `ban_${user.id}` }
      ],
      [
        { text: 'Выдать запросы', callback_data: `give_subscription_${user.id}` },
        { text: 'Забрать запросы', callback_data: `remove_subscription_${user.id}` }
      ],
      [
        { text: 'Назад', callback_data: `users_list_1` }
      ]
    ];
    await ctx.editMessageText(message, {
      reply_markup: { inline_keyboard: keyboard },
      parse_mode: 'Markdown'
    });
  });
  return module;
})