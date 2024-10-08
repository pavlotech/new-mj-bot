// module.class.ts
import Logger from "./logger.class";
import { IBotContext } from "../context/context.interface";
import { Scenes, Telegraf } from "telegraf";
import { IConfigService } from "../config/config.interface";
import { ModuleOptions } from "./interfaces/module.interface";
import { Locale } from "../locale/locale.service";
import App from "../app";

export default class ModuleBuilder {
  constructor(
    public readonly name: string,
    public readonly build: (module: Module) => Module | Promise<Module>
  ) { }
}

export class Module {
  public readonly config: IConfigService
  public readonly logger: Logger
  public readonly app: App
  public readonly bot: Telegraf<IBotContext>
  public readonly locale: Locale
  public readonly scene?: Scenes.BaseScene<IBotContext>

  constructor(
    private options: ModuleOptions
  ) {
    this.config = this.options.config;
    this.logger = this.options.logger;
    this.app = this.options.app;
    this.bot = this.options.bot;
    this.locale = new Locale();
    this.scene = this.options.scene;
  }

  public async on(callback: (...args: any[]) => Promise<void>) {
    try {
      await callback();
    } catch (error) {
      this.logger.error(`Error in module event '${event}':`, error);
    }
  }
}