export default {
  commands: [
    {
      command: 'start',
      description: 'Запустить бота',
    },
    {
      command: 'vip',
      description: 'Купить подписку',
    },
    {
      command: 'my_profile',
      description: 'Мой профиль'
    },
    {
      command: 'ratio',
      description: 'Смена соотношения сторон (1:1, 4:3, 16:9)'
    },
    {
      command: 'blend',
      description: 'Генерация на основе двух изображений'
    },
    {
      command: 'describe',
      description: 'Генерация фото + текст'
    },
  ],
  stage: {
    ttl: 10 * 60 * 1000
  },
  start: {
    firstMessage: `
Вы подписались на KolerskyMidjorneyBot!

Он генерирует изображения с помощью нейросети Midjorney. Одной из лучших на данный момент.
Подпишитесь на канал, чтобы всегда иметь актуальную информацию: @kolerskych. Там же обсуждение и вопросы.
    
[Инструкция](https://kolersky.com/mj)
Чтобы сгенерировать фото, просто напишите свой запрос боту.
    `,
    secondMessage: `
Для использования нейросети оплатите доступ.
                  
После этого вы сразу сможете пользоваться нейросетью.
                            
Для просмотра тарифов жмите /vip
    `    
  },
  vip: {
    getInvoice: (chatId: number) => {
      const invoice = {
        chat_id: chatId,
        provider_token: '',
        start_parameter: 'get_access',
        title: 'Чек на оплату 50 запросов в боте',
        description: 'Увеличит количество запросов в боте на 50',
        currency: 'XTR',
        prices: [{ label: 'Чек на оплату 50 запросов в боте', amount: 300 }],
        payload: `${chatId}_${Number(new Date())}`    
      }
      return invoice      
    },
    price: 490,
    quantity: 50,
    firstMessage: `
Подписка дает 50 обработок изображений в сумме. 
  
Стоимость: 490 руб
  
Чтобы купить нажмите на кнопку ниже
    `,
    paymentCheck: `Обработка оплаты...`,
    invoiceName: `Доступ к сервису Midjourney`,
    noRequest: `У вас закончились запросы.\nКупить еще 50 - /vip`,
    description: "VIP-подписка Midjourney-бот.",
    successfulPayment: `Оплата прошла успешно`
  },
  rem_background: `Режим изменен на удаление фона`,
  rem_text: `Режим изменен на удаление текста`,
  rem_logo: `Режим изменен на удаление логотипа`,
  text: 'Напишите текст',
  photo: `Отправьте фото`,
  first_photo: `Отправьте первое фото`,
  second_photo: `Отправьте второе фото`,
  waiting_time: `Время ожидания истекло`,
  errorMessage: `Произошла ошибка попробуйте позже`,
  waitRequest: `Дождитесь выполнения предыдущего запроса`,
  admin: {
    text: `Права администратора`,
    button: `Получить`    
  },
  generationButtons: [
    [
      { text: 'U1', callback_data: 'upscale1' },
      { text: 'U2', callback_data: 'upscale2' },
      { text: 'U3', callback_data: 'upscale3' },
      { text: 'U4', callback_data: 'upscale4' },
    ],
    [
      { text: 'V1', callback_data: 'variation1' },
      { text: 'V2', callback_data: 'variation2' },
      { text: 'V3', callback_data: 'variation3' },
      { text: 'V4', callback_data: 'variation4' }
    ],
    [
      { text: '🔄', callback_data: 'reroll' }
    ]
  ],
  customButtons: [
    [
      { text: 'Upscale (2x)', callback_data: 'upscale_creative' },
      { text: 'Upscale (4x)', callback_data: 'upscale_subtle' },
    ],
    [
      { text: 'Vary (Subtle)', callback_data: 'low_variation' },
      { text: 'Vary (Strong)', callback_data: 'high_variation' },
    ],
    [
      { text: 'Zoom Out 2x', callback_data: 'outpaint_2x' },
      { text: 'Zoom Out 1.5x', callback_data: 'outpaint_1.5x' },
      { text: 'Custom Zoom', callback_data: 'outpaint_custom' },
    ],
    [
      { text: '⬅️', callback_data: 'pan_left' },
      { text: '➡️', callback_data: 'pan_right' },
      { text: '⬆️', callback_data: 'pan_up' },
      { text: '⬇️', callback_data: 'pan_down' }
    ],
  ],
  buttons: [
    'upscale1', 'upscale2', 'upscale3', 'upscale4',
    'variation1', 'variation2', 'variation3', 'variation4',
    'reroll',
    
    'high_variation', 'low_variation',
    'outpaint_1.5x', 'outpaint_2x', 'outpaint_custom',
    'pan_down', 'pan_left', 'pan_right', 'pan_up',
    'upscale_creative', 'upscale_subtle'
  ],
  photosDirectory: 'photos'
}