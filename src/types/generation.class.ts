import { TelegramError } from "telegraf";
import { IBotContext } from "../context/context.interface";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import Logger from "./logger.class";
import { IConfigService } from "src/config/config.interface";

export class Generation {
  private readonly prisma: PrismaClient;
  private readonly logger: Logger;
  private readonly config: IConfigService;
  private ctx: IBotContext;
  private readonly user: any;
  private readonly params: object;
  private readonly buttons: any;
  private readonly entity: string

  constructor(
    prisma: PrismaClient,
    logger: Logger,
    config: IConfigService,
    ctx: IBotContext,
    user: any,
    entity: string,
    params: object,
    buttons: any
  ) {
    this.prisma = prisma;
    this.logger = logger;
    this.config = config;
    this.ctx = ctx;
    this.user = user;
    this.entity = entity;
    this.params = params;
    this.buttons = buttons;
    this.main();
  }

  private addTaskIdToButtons(task_id: string) {
    return this.buttons.map((row: any) =>
      row.map((button: any) => ({
        ...button,
        callback_data: `${button.callback_data}_${task_id}`
      }))
    );
  }
  private request = async (entity: string, data: any) => {
    try {
      const response = await axios({
        headers: {
          "X-API-KEY": this.config.get('X_API_KEY'),
        },
        data: data,
        url: `https://api.midjourneyapi.xyz/mj/v2/${entity}`,
        method: 'post'
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(error.message);
      return { success: false, message: error.message };
    }
  };

  private fetchData = async (ctx: IBotContext, task_id: string): Promise<any> => {
    try {
      for (let counter = 0; counter < 180; counter++) {
        const fetch = await this.request("fetch", {
          task_id: task_id,
        });
      
        if (fetch.status === "finished") {
          return fetch;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      return;
    } catch (error) {
      this.logger.error(error);
    }
  };

  private main = async () => {
    let fetchResult: any;
    try {
      const generate = await this.request(this.entity, this.params);
      //this.logger.log(generate);

      const editMessage = await this.ctx.reply('Генерация...')
      if (!generate.success) {
        if (generate.message.startsWith('prompt check:')) {
          const message = generate.message;
          const bannedPrompt = message.slice(message.indexOf("Banned Prompt:") + "Banned Prompt: ".length);
          return await this.ctx.editMessageText(`Запрос "${bannedPrompt}" не прошел модерацию`, {
            parse_mode: 'Markdown'
          });
        }
      }

      const fetch = await this.fetchData(this.ctx, generate.task_id);

      await this.prisma.task.create({
        data: {
          id: fetch.task_id,
          user: this.user.id,
          date: Date.now(),
        },
      });

      fetchResult = fetch;
      const updatedButtons = this.addTaskIdToButtons(fetch.task_id);
      //this.logger.log(updatedButtons)

      await this.ctx.deleteMessage(editMessage.message_id)
      await this.ctx.replyWithPhoto(
        { url: fetch.task_result.image_url },
        {
          caption: `[Ссылка на изображение](${fetch.task_result.image_url})`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: updatedButtons,
          },
        }
      );

      await this.prisma.user.update({
        where: { id: this.user.id },
        data: { subscribe: this.user.subscribe - 1 },
      });
    } catch (error) {
      if (error instanceof TelegramError) {
        if (error.response.error_code === 429) {
          const retryAfter = error.response.parameters?.retry_after || 5;
          this.logger.warn(`Too many requests, retrying after ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        }
        if (error.response.description.startsWith('Bad Request: file')) {
          await this.ctx.reply(
            `Файл слишком большой\n[Ссылка на изображение](${fetchResult.task_result.discord_image_url})`,
            {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: this.buttons,
              },
            }
          );
        }
        await this.prisma.user.update({
          where: { id: this.user.id },
          data: { subscribe: this.user.subscribe - 1 },
        });
      } else {
        await this.ctx.reply(`Произошла ошибка попробуйте позже`, { parse_mode: 'Markdown' });
        this.logger.error(error);
      }
    }
  };
}