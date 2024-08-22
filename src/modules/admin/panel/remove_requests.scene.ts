import ModuleBuilder, { Module } from '../../../types/module.class';

export default new ModuleBuilder('remove_requests_scene', (module: Module) => {
  module.scene?.enter(async (ctx) => {
    await ctx.reply('Введите колличество', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Отменить', callback_data: 'cancel' }]
        ]
      },
      parse_mode: 'Markdown'
    })
  })
  module.scene?.on('text', async (ctx) => {
    const num = Number(ctx.message.text)
    
    const admin = await module.app.prisma.admin.findUnique({
      where: { id: ctx.from.id }
    })
    const user = await module.app.prisma.user.findUnique({
      where: {
        id: admin?.userId
      }
    })
    await module.app.prisma.user.update({
      where: {
        id: admin?.userId
      },
      data: {
        subscribe: Number(user?.subscribe) - num
      }
    })
    await ctx.reply(`Пользователю [${user?.name}](tg://user?id=${admin?.userId}) (ID: \`${admin?.userId}\`) удалены запросы в количестве ${num}`, {
      parse_mode: 'Markdown'
    })
    await ctx.scene.leave()
  })
  return module;
})