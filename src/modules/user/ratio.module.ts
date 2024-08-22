import ModuleBuilder, { Module } from '../../types/module.class';

export default new ModuleBuilder('ratio', (module: Module) => {
  module.bot.command('ratio', async (ctx) => {
    const user = await module.app.prisma.user.findUnique({
      where: {
        id: ctx.from.id
      }
    });
    if (!user || user.ban) return;
    let newRatio, response;
    switch (user.ratio) {
      case '1:1':
        newRatio = '4:3';
        response = 'Разрешение изменено на 4:3';
        break;
      case '4:3':
        newRatio = '16:9';
        response = 'Разрешение изменено на 16:9';
        break;
      case '16:9':
        newRatio = '1:1';
        response = 'Разрешение изменено на 1:1';
        break;
      default:
        return;
    }
    await module.app.prisma.user.update({
      where: {
        id: ctx.from.id
      },
      data: {
        ratio: newRatio
      }
    });
    await ctx.reply(`${response}`, {
      parse_mode: "Markdown"
    });
    
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
  });
  return module;
})