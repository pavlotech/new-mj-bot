import ModuleBuilder, { Module } from '../../types/module.class';
import { generationParams } from "../../functions/params.function";
import config from "../../../config";
import { Generation } from "../../types/generation.class";

export default new ModuleBuilder('text', (module: Module) => {
  module.bot.on('text', async (ctx) => {
    const user = await module.app.prisma.user.findUnique({
      where: { id: ctx.from.id }
    });

    if (!user || user.ban) return;
    if (user.subscribe <= 0) {
      return await ctx.reply(config.vip.noRequest, { parse_mode: 'Markdown' });
    }

    const commands = config.commands.map(command => `/${command.command}`);
    commands.push('/panel');
    
    if (commands.some((command: string) => ctx.message.text.includes(command))) {
      return await ctx.reply('Это команда!');
    }

    let prompt = ctx.message.text.trim();
    const linkRegex = /(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*/gi;
    const matches = ctx.message.text.matchAll(linkRegex);
    let links = '';

    for (const match of matches) {
      links += match[0].trim() + ' ';
      prompt = prompt.replace(match[0], '').trim();
    }

    const processedPrompt = await module.locale.translate(prompt, 'en');
    const fullPrompt = `${links + (links ? '\n' : '')} ${processedPrompt}`;

    try {
      new Generation(
        module.app.prisma,
        module.logger,
        module.config,
        ctx,
        user,
        'imagine',
        {
          prompt: fullPrompt,
          aspect_ratio: user.ratio,
          process_mode: "fast",
        },
        config.generationButtons
      );
    } catch (error: any) {
      if (error.response?.error_code === 429 && error.response?.parameters?.retry_after) {
        const retryAfter = error.response.parameters.retry_after * 1000;
        console.error(`Rate limit hit. Retrying after ${retryAfter}ms...`);

        setTimeout(async () => {
          new Generation(
            module.app.prisma,
            module.logger,
            module.config,
            ctx,
            user,
            'imagine',
            {
              prompt: fullPrompt,
              aspect_ratio: user.ratio,
              process_mode: "fast",
            },
            config.generationButtons
          );
        }, retryAfter);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  });

  module.bot.action(/^([a-zA-Z0-9._-]+)_([a-zA-Z0-9-]+)$/, async (ctx) => {
    const buttonType = ctx.match[1];
    const taskId = ctx.match[2];

    module.logger.log(buttonType)
    module.logger.log(taskId)
    const task = await module.app.prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) return;

    const user = await module.app.prisma.user.findUnique({
      where: { id: ctx.from?.id }
    });

    if (!user || user.ban) return;
    if (user.subscribe <= 0) {
      return await ctx.reply(config.vip.noRequest, {
        parse_mode: 'Markdown'
      });
    }

    const params = generationParams(task.id, buttonType, user);

    try {
      new Generation(
        module.app.prisma,
        module.logger,
        module.config,
        ctx,
        user,
        params.name || '',
        params.params,
        params.generationType
      );
    } catch (error: any) {
      if (error.response?.error_code === 429 && error.response?.parameters?.retry_after) {
        const retryAfter = error.response.parameters.retry_after * 1000;
        module.logger.error(`Rate limit hit. Retrying after ${retryAfter}ms...`);

        setTimeout(async () => {
          new Generation(
            module.app.prisma,
            module.logger,
            module.config,
            ctx,
            user,
            params.name || '',
            params.params,
            params.generationType
          );
        }, retryAfter);
      } else {
        module.logger.error('An unexpected error occurred:', error);
      }
    }
  });
  return module;
});