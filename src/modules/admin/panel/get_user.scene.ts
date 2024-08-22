import ModuleBuilder, { Module } from '../../../types/module.class';

export default new ModuleBuilder('get_user_data_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply('Введите ID пользователя', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Отменить', callback_data: 'cancel' }]
        ]
      },
      parse_mode: 'Markdown'
    })
  })
  module.scene?.on('text', async (ctx) => {
    const num = Number(ctx.from.id);
    if (isNaN(num)) {
      return ctx.reply('Ошибка: ID пользователя должен быть числом.');
    }
    const user = await module.app.prisma.user.findUnique({
      where: { id: num },
    });

    if (!user) {
      return ctx.reply('Ошибка: Пользователь не найден.');
    }
    await ctx.reply(
      `Пользователь: ${user.name}\nID: ${user.id}\nОстаток запросов: ${user.subscribe}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Выдать запросы', callback_data: 'give_requests' },
              { text: 'Удалить запросы', callback_data: 'remove_requests' }
            ],
            [
              { text: 'Заблокировать', callback_data: 'ban' },
              { text: 'Разблокировать', callback_data: 'unban' }
            ],
            [
              { text: 'Отменить', callback_data: 'cancel' }
            ]
          ]
        },
        parse_mode: 'Markdown'
      }
    );
    await module.app.prisma.admin.update({
      where: { id: ctx.from.id },
      data: { userId: num },
    });
  });
  module.scene?.action('ban', async (ctx) => {
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: ctx.from.id }
    })
    const user = await module.app.prisma.user.findUnique({
      where: {
        id: admin?.userId
      }
    })
    if (user?.ban) {
      await ctx.reply('Пользователь уже заблокирован', {
        parse_mode: 'Markdown'
      });
      return;
    }
    await module.app.prisma.user.update({
      where: {
        id: user?.id
      },
      data: {
        ban: false
      }
    })
    const admins = await module.app.prisma.admin.findMany({ where: { logs: true } });
    const message = `[${user?.name}](tg://user?id=${Number(user?.id)}) (ID: \`${Number(user?.id)}\`) был заблокирован`;
    admins.forEach(async (admin) => {
      await ctx.telegram.sendMessage(Number(admin.id), message, {
        parse_mode: 'Markdown'
      });
    });
    await ctx.scene.leave()
  })
  module.scene?.action('unban', async (ctx) => {
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: ctx.from.id }
    })
    const user = await module.app.prisma.user.findUnique({
      where: {
        id: admin?.userId
      }
    })
    if (user?.ban) {
      await ctx.reply('Пользователь уже заблокирован', {
        parse_mode: 'Markdown'
      });
      return;
    }
    await module.app.prisma.user.update({
      where: {
        id: user?.id
      },
      data: {
        ban: false
      }
    })
    const admins = await module.app.prisma.admin.findMany({ where: { logs: true } });
    const message = `[${user?.name}](tg://user?id=${Number(user?.id)}) (ID: \`${Number(user?.id)}\`) был разблокирован`;
    admins.forEach(async (admin) => {
      await ctx.telegram.sendMessage(Number(admin.id), message, {
        parse_mode: 'Markdown'
      });
    });
    await ctx.scene.leave()
  })
  module.scene?.action('give_requests', async (ctx) => {
    await ctx.scene.enter('give_requests_scene')
  })
  module.scene?.action('remove_requests', async (ctx) => {
    await ctx.scene.enter('remove_requests_scene')
  })
  return module;
})