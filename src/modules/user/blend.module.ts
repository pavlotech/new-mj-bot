import config from '../../../config';
import ModuleBuilder, { Module } from '../../types/module.class';

export default new ModuleBuilder('blend', (module: Module) => {
  module.bot.command('blend', async (ctx) => {
    const user = await module.app.prisma.user.findUnique({
      where: {
        id: ctx.from.id
      }
    })
    if (!user || user.ban) return;
    if (user.subscribe <= 0) return await ctx.reply(config.vip.noRequest, {
      parse_mode: 'Markdown'
    })

    await ctx.scene.enter('blend_first_image_scene')
    
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