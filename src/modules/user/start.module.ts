import { Markup } from 'telegraf';
import config from '../../../config';
import ModuleBuilder, { Module } from '../../types/module.class';

export default new ModuleBuilder('start', (module: Module) => {
  module.bot.start(async (ctx) => {
    const user = await module.app.prisma.user.findUnique({
      where: { id: ctx.from.id }
    })
    const username = ctx.from.username;
    const firstName = ctx.from.first_name;
    const lastName = ctx.from.last_name;

    if (!user) {
      await module.app.prisma.user.create({
        data: {
          id: ctx.from.id,
          registry: Date.now(),
          name: username ? `${username}` : `${firstName}${lastName ? ` ${lastName}` : ''}`,
        }
      })
    }
    if (user?.ban) return
    await ctx.replyWithPhoto(
      { source: 'start-image.jpg' },
      {
        caption: config.start.firstMessage,
        parse_mode: 'Markdown'
      }
    );
    if (!user || user.subscribe <= 0) {
      await new Promise(resolve => setTimeout(resolve, 250));
      await ctx.reply(config.start.secondMessage, {
        parse_mode: 'Markdown'
      });
    }

  })
  return module;
})