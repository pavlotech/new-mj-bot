// app.ts
import config from '../config';
import { IBotContext } from './context/context.interface';
import fs from "fs";
import path from "path";
import { Scenes, Telegraf, session } from "telegraf";
import Logger from "./types/logger.class";
import ModuleBuilder, { Module } from './types/module.class';
import { IConfigService } from './config/config.interface';
import { PrismaClient } from '@prisma/client';
import { tinkoffPAY } from './types/tinkoff.class';
import LocalSession from 'telegraf-session-local';

export default class App {
  private readonly logger: Logger;
  private readonly bot: Telegraf<IBotContext>;
  public readonly prisma: PrismaClient;
  public readonly tinkoff: tinkoffPAY;


  constructor(
    private readonly config: IConfigService,
    private readonly TOKEN: string
  ) {
    this.prisma = new PrismaClient()
    this.tinkoff = new tinkoffPAY(
      this.config.get('SHOP_ID'),
      this.config.get('SECRET_KEY')
    );
    this.logger = new Logger({
      logDirectory: 'logs',
      saveIntervalHours: 1,
      colorizeObjects: true
    });
    this.bot = new Telegraf<IBotContext>(this.config.get(this.TOKEN), {
      handlerTimeout: 60 * 60 * 1000
    });
    this.main();
  }
  private async main() {
    const startTime = performance.now();
    const [sceneModuleBuilders, moduleBuilders, eventBuilders] = await Promise.all([
      this.importModules('scene'),
      this.importModules('module'),
      this.importModules('event'),
    ]);
    const endTime = performance.now();
    this.logger.warn(`Time taken to import all modules: ${endTime - startTime} milliseconds`);

    const scenes = await this.buildScenes(sceneModuleBuilders);
    const stage = new Scenes.Stage<IBotContext>(scenes, config.stage);

    this.bot.use(session());
    //this.bot.use((new LocalSession({ database: 'example_db.json' }).middleware()))
    this.bot.use(stage.middleware());
    this.bot.telegram.setMyCommands(config.commands);

    const launchOptions: Telegraf.LaunchOptions = {
      // launch options
    };
    await Promise.all([
      this.buildModules(moduleBuilders),
      this.buildModules(eventBuilders),
      this.bot.launch(launchOptions, () => this.logger.info(`${this.bot.botInfo?.username} started successfully`)),
      this.checkAndCreateAdmin()
    ]);
  }
  private async checkAndCreateAdmin() {
    const adminId = Number(this.config.get('ADMIN_ID'));
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!existingAdmin) {
      this.logger.log(await this.prisma.admin.create({
        data: { id: adminId }
      }));
      this.logger.info(`Admin with ID ${adminId} created in the database.`);
    }
  }
  private async buildScenes(sceneModuleBuilders: ModuleBuilder[]) {
    return Promise.all(sceneModuleBuilders.map(async builder => {
      const scene = new Scenes.BaseScene<IBotContext>(builder.name);
      await builder.build(this.createModule(scene));
      return scene;
    }));
  }
  private async buildModules(moduleBuilders: ModuleBuilder[]) {
    return Promise.all(moduleBuilders.map(builder => builder.build(this.createModule())));
  }
  private createModule(scene?: Scenes.BaseScene<IBotContext>) {
    return new Module({
      app: this,
      config: this.config,
      bot: this.bot,
      logger: this.logger,
      scene
    });
  }
  private async importModules(keyword: string): Promise<ModuleBuilder[]> {
    const modules: ModuleBuilder[] = [];
    const searchPattern = new RegExp(`.*${keyword}.*\\.(js|ts)$`);
    const dirsToExplore: string[] = [path.join(__dirname, 'modules')];
    const loadedModules: Set<string> = new Set();
    const filePaths: string[] = [];
  
    while (dirsToExplore.length > 0) {
      const currentDir = dirsToExplore.pop()!;
      try {
        const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isFile() && entry.name.match(searchPattern)) {
            filePaths.push(fullPath);
          } else if (entry.isDirectory()) {
            dirsToExplore.push(fullPath);
          }
        }
      } catch (error) {
        this.logger.error(`Error reading directory ${currentDir}:`, error);
      }
    }
  
    const importPromises = filePaths.map(async (filePath) => {
      try {
        const { default: importedModule } = await import(filePath);
        if (importedModule instanceof ModuleBuilder) {
          if (loadedModules.has(importedModule.name)) {
            throw new Error(`Module with name '${importedModule.name}' already loaded`);
          }
          modules.push(importedModule);
          loadedModules.add(importedModule.name);
          this.logger.info(`Module '${importedModule.name}' loaded from ${filePath}`);
        }
      } catch (error) {
        this.logger.error(`Error loading module from ${filePath}:`, error);
      }
    });
  
    await Promise.all(importPromises);
    return modules;
  }
}