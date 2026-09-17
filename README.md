# 🧩 Telegram Multi-Tool Bot

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/) [![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/) [![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Telegram Bot API](https://img.shields.io/badge/Telegram-Bot%20API-26A5E4?style=flat-square&logo=telegram&logoColor=white)](https://core.telegram.org/bots/api) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](#-license--مجوز--лицензия--许可证) [![Languages](https://img.shields.io/badge/Languages-15-informational?style=flat-square)](#-supported-languages)

**A serverless Telegram bot for building, delivering, and scheduling reusable messages — running entirely on Cloudflare Workers + D1.**

**🌐 Choose your language**
**زبان خود را انتخاب کنید**
**Выберите язык**
**选择语言**

[![English](https://img.shields.io/badge/🇬🇧-English-0052CC?style=flat-square)](#-english) [![فارسی](https://img.shields.io/badge/🇮🇷-فارسی-239F40?style=flat-square)](#-فارسی) [![Русский](https://img.shields.io/badge/🇷🇺-Русский-D02B89?style=flat-square)](#-русский) [![中文](https://img.shields.io/badge/🇨🇳-中文-DE2910?style=flat-square)](#-中文)

---

## 🇬🇧 English

### Overview

**Telegram Multi-Tool Bot** is a single-file JavaScript bot that runs entirely on **Cloudflare Workers**, using **Cloudflare D1** as its only storage layer. It lets you compose a message once — with optional colored inline buttons — and deliver it cleanly (no "forwarded from" tag) to any channel or group the bot administers, on demand or on a schedule. It ships with saved destinations, inline sharing, a numeric ID finder, and a full admin panel.

### ✨ Features

- 🧩 **Message builder** — compose text, photo, video, or file exactly as it should be delivered, optionally attach colored inline buttons, and get a reusable share **code**
- 📤 **Send without quote** — deliver a saved code to any admin channel/group via `copyMessage`, with no forward tag
- ⏰ **Scheduled sending** — queue a message to go out after N hours, delivered by a Cloudflare Cron Trigger
- 🗂 **Saved channels/groups** — quick one-tap destinations per user
- 🔗 **Inline sharing** — share a saved message into any chat via Telegram's inline mode
- 🆔 **Numeric ID finder** — resolve IDs via `@username`, a forwarded message, `/myid`, or in-chat `/id`
- 🛠 **Admin panel** — broadcast, statistics, join-lock channels, donation wallet
- 💛 **Support/Donate button** — shows the admin-configured wallet to users
- 📊 **Code management** — view stats, edit buttons, or delete any message code
- ⚙️ **Zero-config webhook** — the webhook secret is derived from `BOT_TOKEN` itself; opening the Worker URL once registers it automatically
- 💾 **Minimal footprint** — all state lives in a single `kv` table in D1

### 📋 Requirements

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

### 🚀 Deployment

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Create Worker**, give it a name, and deploy the default template.
2. Open the new Worker's **Edit code** view, delete the placeholder code, and paste in the full contents of `worker.js`. Click **Deploy**.
3. Go to **Workers & Pages → D1 → Create database**, name it (e.g. `tg-multitool-db`), and create it.
4. Open the new database's **Console** tab, paste in the full contents of `schema.sql`, and run it to create the required table.
5. Back in your Worker, go to **Settings → Bindings → Add binding → D1 database**, set the variable name to `DB`, and select the database you just created. Save.
6. Go to **Settings → Variables and Secrets** and add:
   | Name | Type | Value |
   | --- | --- | --- |
   | `BOT_TOKEN` | Secret | Your bot token from `@BotFather` |
   | `ADMIN_IDS` | Text | Comma-separated numeric admin IDs, e.g. `111111111,222222222` |
7. Go to **Settings → Triggers → Cron Triggers → Add Cron Trigger** and add a schedule such as `*/5 * * * *` (needed for scheduled sends to be delivered).
8. Open your Worker's URL (`https://your-worker.workers.dev/`) once in a browser — it verifies and registers the Telegram webhook automatically.

### 🔌 Enable Inline Mode (required)

> ⚠️ **This step cannot be done from the code or dashboard — it must be set manually in BotFather.** Without it, the **Share** button will not work, and tapping it in any chat will not show a message preview.

1. Open a chat with [@BotFather](https://t.me/BotFather).
2. Send `/mybots` and select your bot.
3. Go to **Bot Settings → Inline Mode → Turn on**.
4. (Optional) Set a placeholder text shown in the chat input while using inline mode.

### ⚙️ Configuration

| Variable    | Type    | Required | Description                                                     |
| ----------- | ------- | -------- | ---------------------------------------------------------------- |
| `BOT_TOKEN` | Secret  | Yes      | Bot token from `@BotFather`                                       |
| `ADMIN_IDS` | Var     | Yes      | Comma-separated numeric Telegram IDs with admin-panel access      |
| `DB`        | Binding | Yes      | D1 database binding used for all storage                         |

### ▶️ Usage

- `/start` — pick a language and open the main menu
- `/lang` — change your language anytime
- **Create message** → build content + buttons → get a share code
- **Send without quote** → paste a code → pick a saved or new destination
- **My channels/groups** → save destinations for one-tap sending
- **Find numeric ID** → resolve IDs from a username, forward, or `/id`/`/myid`
- **Admin panel** (admins only) → broadcast, stats, join-locks, wallet

### 🈺 Supported Languages

🇬🇧 English · 🇮🇷 Persian · 🇷🇺 Russian · 🇸🇦 Arabic · 🇪🇸 Spanish · 🇨🇳 Chinese · 🇮🇳 Hindi · 🇫🇷 French · 🇩🇪 German · 🇯🇵 Japanese · 🇹🇷 Turkish · 🇵🇹 Portuguese · 🇧🇩 Bengali · 🇵🇰 Urdu · 🇮🇩 Indonesian

---

## 🇮🇷 فارسی

### معرفی

**ربات چندمنظوره تلگرام** یک بات جاوااسکریپت تک‌فایلی است که به‌طور کامل روی **Cloudflare Workers** اجرا می‌شود و از **Cloudflare D1** به‌عنوان تنها لایه ذخیره‌سازی استفاده می‌کند. با این ربات یک پیام را یک‌بار می‌سازید — همراه با دکمه‌های شیشه‌ای رنگی اختیاری — و بدون برچسب «فوروارد شده از»، آن را به هر کانال یا گروهی که ربات در آن ادمین است، فوری یا زمان‌بندی‌شده ارسال می‌کنید. این پروژه شامل مقصدهای ذخیره‌شده، اشتراک‌گذاری اینلاین، پیدا کردن آیدی عددی، و یک پنل مدیریت کامل است.

### ✨ امکانات

- 🧩 **سازنده پیام** — متن، عکس، ویدیو یا فایل را دقیقاً همان‌طور که باید ارسال شود بسازید، دکمه‌های شیشه‌ای رنگی اضافه کنید، و یک **کد** اشتراک‌گذاری قابل استفاده مجدد دریافت کنید
- 📤 **ارسال بدون نقل‌قول** — ارسال کد ذخیره‌شده به هر کانال/گروهی که ربات در آن ادمین است، از طریق `copyMessage`، بدون برچسب فوروارد
- ⏰ **ارسال زمان‌بندی‌شده** — قرار دادن پیام در صف برای ارسال پس از چند ساعت، از طریق Cloudflare Cron Trigger
- 🗂 **کانال‌ها/گروه‌های ذخیره‌شده** — مقصدهای سریع تک‌ضربه‌ای برای هر کاربر
- 🔗 **اشتراک‌گذاری اینلاین** — ارسال پیام ذخیره‌شده به هر چتی از طریق حالت اینلاین تلگرام
- 🆔 **یابنده آیدی عددی** — پیدا کردن آیدی از طریق یوزرنیم، پیام فوروارد شده، `/myid`، یا `/id` در داخل گروه
- 🛠 **پنل مدیریت** — ارسال همگانی، آمار، قفل عضویت اجباری، کیف پول دونیت
- 💛 **دکمه حمایت/دونیت** — نمایش کیف پول تنظیم‌شده توسط ادمین به کاربران
- 📊 **مدیریت کد پیام** — مشاهده آمار، ویرایش دکمه‌ها، یا حذف هر کد پیام
- ⚙️ **راه‌اندازی بدون پیکربندی وب‌هوک** — رمز وب‌هوک از خود `BOT_TOKEN` مشتق می‌شود؛ باز کردن یک‌باره آدرس Worker آن را به‌طور خودکار ثبت می‌کند
- 💾 **حداقل مصرف فضا** — تمام داده‌ها در یک جدول `kv` در D1 نگهداری می‌شود

### 📋 پیش‌نیازها

- یک [حساب Cloudflare](https://dash.cloudflare.com/sign-up) (پلن رایگان کافی است)
- یک توکن ربات از [@BotFather](https://t.me/BotFather)

### 🚀 نحوه استقرار

1. در پنل Cloudflare به مسیر **Workers & Pages → Create → Create Worker** بروید، یک نام برای آن انتخاب کنید و قالب پیش‌فرض را دیپلوی کنید.
2. وارد بخش **Edit code** ورکر تازه‌ساخته‌شده شوید، کد پیش‌فرض را پاک کنید و کل محتوای فایل `worker.js` را جایگزین آن کنید. سپس روی **Deploy** کلیک کنید.
3. به مسیر **Workers & Pages → D1 → Create database** بروید، یک نام برایش انتخاب کنید (مثلاً `tg-multitool-db`) و آن را بسازید.
4. وارد تب **Console** همان دیتابیس شوید، کل محتوای فایل `schema.sql` را در آن پیست کنید و اجرا کنید تا جدول مورد نیاز ساخته شود.
5. برگردید به ورکر خود، به مسیر **Settings → Bindings → Add binding → D1 database** بروید، نام متغیر را `DB` بگذارید و دیتابیسی که ساختید را انتخاب کنید. ذخیره کنید.
6. به مسیر **Settings → Variables and Secrets** بروید و موارد زیر را اضافه کنید:
   | نام | نوع | مقدار |
   | --- | --- | --- |
   | `BOT_TOKEN` | Secret | توکن ربات از `@BotFather` |
   | `ADMIN_IDS` | Text | آیدی‌های عددی ادمین با کاما جدا شده، مثل `111111111,222222222` |
7. به مسیر **Settings → Triggers → Cron Triggers → Add Cron Trigger** بروید و یک زمان‌بندی مثل `*/5 * * * *` اضافه کنید (برای اینکه ارسال‌های زمان‌بندی‌شده واقعاً تحویل داده شوند).
8. آدرس Worker خود را (`https://your-worker.workers.dev/`) یک‌بار در مرورگر باز کنید — وب‌هوک تلگرام به‌طور خودکار بررسی و ثبت می‌شود.

### 🔌 فعال‌سازی Inline Mode (الزامی)

> ⚠️ **این مرحله از طریق کد یا داشبورد قابل انجام نیست و باید دستی در BotFather فعال شود.** بدون این کار، دکمه **اشتراک‌گذاری (Share)** کار نمی‌کند و با زدن آن در هر چتی، پیش‌نمایش پیام نمایش داده نمی‌شود.

1. یک چت با [@BotFather](https://t.me/BotFather) باز کنید.
2. دستور `/mybots` را بفرستید و ربات خود را انتخاب کنید.
3. به مسیر **Bot Settings → Inline Mode → Turn on** بروید.
4. (اختیاری) یک متن راهنما برای نمایش در نوار ورودی چت هنگام استفاده از حالت اینلاین تنظیم کنید.

### ⚙️ پیکربندی

| متغیر       | نوع    | الزامی | توضیحات                                              |
| ----------- | ------ | ------ | ------------------------------------------------------ |
| `BOT_TOKEN` | Secret | بله    | توکن ربات از `@BotFather`                              |
| `ADMIN_IDS` | Var    | بله    | آیدی‌های عددی تلگرام با کاما جدا شده، دسترسی پنل ادمین |
| `DB`        | Binding| بله    | باندینگ دیتابیس D1 برای تمام ذخیره‌سازی                |

### ▶️ نحوه استفاده

- `/start` — انتخاب زبان و باز کردن منوی اصلی
- `/lang` — تغییر زبان در هر زمان
- **ساخت پیام** ← ساخت محتوا + دکمه‌ها ← دریافت کد اشتراک‌گذاری
- **ارسال بدون نقل‌قول** ← وارد کردن کد ← انتخاب مقصد ذخیره‌شده یا جدید
- **کانال/گروه‌های من** ← ذخیره مقصدها برای ارسال تک‌ضربه‌ای
- **پیدا کردن آیدی عددی** ← از طریق یوزرنیم، فوروارد، یا `/id`/`/myid`
- **پنل مدیریت** (فقط ادمین‌ها) ← ارسال همگانی، آمار، قفل عضویت، کیف پول

### 🈺 زبان‌های پشتیبانی‌شده

🇬🇧 انگلیسی · 🇮🇷 فارسی · 🇷🇺 روسی · 🇸🇦 عربی · 🇪🇸 اسپانیایی · 🇨🇳 چینی · 🇮🇳 هندی · 🇫🇷 فرانسوی · 🇩🇪 آلمانی · 🇯🇵 ژاپنی · 🇹🇷 ترکی · 🇵🇹 پرتغالی · 🇧🇩 بنگالی · 🇵🇰 اردو · 🇮🇩 اندونزیایی

---

## 🇷🇺 Русский

### Обзор

**Telegram Multi-Tool Bot** — это однофайловый JavaScript-бот, полностью работающий на **Cloudflare Workers** и использующий **Cloudflare D1** в качестве единственного хранилища. Он позволяет один раз собрать сообщение — с опциональными цветными inline-кнопками — и доставить его без пометки «переслано» в любой канал или группу, где бот является администратором, сразу или по расписанию. В комплекте: сохранённые адресаты, inline-шаринг, поиск числового ID и полноценная админ-панель.

### ✨ Возможности

- 🧩 **Конструктор сообщений** — соберите текст, фото, видео или файл именно так, как он должен быть доставлен, добавьте цветные inline-кнопки и получите многоразовый **код** для отправки
- 📤 **Отправка без цитирования** — доставка сохранённого кода в любой канал/группу через `copyMessage`, без пометки о пересылке
- ⏰ **Отложенная отправка** — постановка сообщения в очередь на отправку через N часов, доставляется через Cloudflare Cron Trigger
- 🗂 **Сохранённые каналы/группы** — быстрые адресаты в один клик для каждого пользователя
- 🔗 **Inline-шаринг** — отправка сохранённого сообщения в любой чат через inline-режим Telegram
- 🆔 **Поиск числового ID** — определение ID по username, пересланному сообщению, `/myid` или `/id` внутри чата
- 🛠 **Админ-панель** — рассылка, статистика, каналы обязательной подписки, кошелёк для донатов
- 💛 **Кнопка поддержки/доната** — показывает пользователям кошелёк, заданный админом
- 📊 **Управление кодами** — просмотр статистики, редактирование кнопок или удаление любого кода сообщения
- ⚙️ **Настройка вебхука без конфигурации** — секрет вебхука выводится из самого `BOT_TOKEN`; однократное открытие URL Worker регистрирует его автоматически
- 💾 **Минимальный объём хранилища** — всё состояние хранится в одной таблице `kv` в D1

### 📋 Требования

- [Аккаунт Cloudflare](https://dash.cloudflare.com/sign-up) (подходит бесплатный тариф)
- Токен бота от [@BotFather](https://t.me/BotFather)

### 🚀 Развёртывание

1. В панели Cloudflare перейдите в **Workers & Pages → Create → Create Worker**, задайте имя и разверните шаблон по умолчанию.
2. Откройте **Edit code** для нового Worker, удалите код-заглушку и вставьте туда полное содержимое `worker.js`. Нажмите **Deploy**.
3. Перейдите в **Workers & Pages → D1 → Create database**, задайте имя (например, `tg-multitool-db`) и создайте её.
4. Откройте вкладку **Console** этой базы данных, вставьте туда полное содержимое `schema.sql` и выполните — это создаст нужную таблицу.
5. Вернитесь в настройки Worker, перейдите в **Settings → Bindings → Add binding → D1 database**, укажите имя переменной `DB` и выберите созданную базу данных. Сохраните.
6. Перейдите в **Settings → Variables and Secrets** и добавьте:
   | Имя | Тип | Значение |
   | --- | --- | --- |
   | `BOT_TOKEN` | Secret | Токен бота от `@BotFather` |
   | `ADMIN_IDS` | Text | Числовые ID админов через запятую, например `111111111,222222222` |
7. Перейдите в **Settings → Triggers → Cron Triggers → Add Cron Trigger** и добавьте расписание, например `*/5 * * * *` (нужно для доставки отложенных сообщений).
8. Один раз откройте URL вашего Worker (`https://your-worker.workers.dev/`) в браузере — вебхук Telegram будет проверен и установлен автоматически.

### 🔌 Включение Inline Mode (обязательно)

> ⚠️ **Этот шаг нельзя выполнить через код или дашборд — его нужно включить вручную в BotFather.** Без этого кнопка **«Поделиться» (Share)** не будет работать, а при нажатии на неё в любом чате предпросмотр сообщения не появится.

1. Откройте чат с [@BotFather](https://t.me/BotFather).
2. Отправьте `/mybots` и выберите своего бота.
3. Перейдите в **Bot Settings → Inline Mode → Turn on**.
4. (Необязательно) Задайте текст-подсказку, отображаемый в поле ввода чата при использовании inline-режима.

### ⚙️ Конфигурация

| Переменная  | Тип       | Обязательна | Описание                                                        |
| ----------- | --------- | ----------- | ---------------------------------------------------------------- |
| `BOT_TOKEN` | Secret    | Да          | Токен бота от `@BotFather`                                        |
| `ADMIN_IDS` | Var       | Да          | Числовые ID Telegram через запятую с доступом к админ-панели      |
| `DB`        | Binding   | Да          | Привязка базы данных D1, используемая для всего хранилища         |

### ▶️ Использование

- `/start` — выбрать язык и открыть главное меню
- `/lang` — сменить язык в любой момент
- **Создать сообщение** → собрать контент + кнопки → получить код для отправки
- **Отправить без цитирования** → вставить код → выбрать сохранённый или новый адресат
- **Мои каналы/группы** → сохранить адресаты для отправки в один клик
- **Найти числовой ID** → по username, пересылке или `/id`/`/myid`
- **Админ-панель** (только для админов) → рассылка, статистика, обязательные подписки, кошелёк

### 🈺 Поддерживаемые языки

🇬🇧 Английский · 🇮🇷 Персидский · 🇷🇺 Русский · 🇸🇦 Арабский · 🇪🇸 Испанский · 🇨🇳 Китайский · 🇮🇳 Хинди · 🇫🇷 Французский · 🇩🇪 Немецкий · 🇯🇵 Японский · 🇹🇷 Турецкий · 🇵🇹 Португальский · 🇧🇩 Бенгальский · 🇵🇰 Урду · 🇮🇩 Индонезийский

---

## 🇨🇳 中文

### 概述

**Telegram 多功能机器人** 是一个完全运行在 **Cloudflare Workers** 上的单文件 JavaScript 机器人，使用 **Cloudflare D1** 作为唯一的存储层。你可以一次性构建一条消息——可选择附加彩色内联按钮——并在不带"转发自"标签的情况下，即时或按计划将其投递到机器人担任管理员的任意频道或群组。项目内置已保存的目标聊天、内联分享、数字 ID 查找器，以及完整的管理面板。

### ✨ 功能特性

- 🧩 **消息构建器** — 按你希望投递的样子构建文本、图片、视频或文件，可选附加彩色内联按钮，并获得可重复使用的分享**代码**
- 📤 **无引用发送** — 通过 `copyMessage` 将已保存的代码投递到任意管理员频道/群组，不带转发标签
- ⏰ **定时发送** — 将消息安排在 N 小时后发送，由 Cloudflare Cron Trigger 负责投递
- 🗂 **已保存的频道/群组** — 每位用户可一键选择的常用目标
- 🔗 **内联分享** — 通过 Telegram 内联模式将已保存的消息分享到任意聊天
- 🆔 **数字 ID 查找器** — 通过用户名、转发消息、`/myid` 或群内 `/id` 解析 ID
- 🛠 **管理面板** — 群发广播、统计数据、强制加群锁定、捐赠钱包
- 💛 **支持/捐赠按钮** — 向用户展示管理员配置的钱包信息
- 📊 **消息代码管理** — 查看统计、编辑按钮，或删除任意消息代码
- ⚙️ **零配置 Webhook** — Webhook 密钥由 `BOT_TOKEN` 本身派生；只需打开一次 Worker 地址即可自动注册
- 💾 **极简存储占用** — 所有状态都保存在 D1 中的单张 `kv` 表里

### 📋 前置要求

- 一个 [Cloudflare 账户](https://dash.cloudflare.com/sign-up)（免费套餐即可）
- 来自 [@BotFather](https://t.me/BotFather) 的机器人令牌

### 🚀 部署步骤

1. 在 Cloudflare 控制台中进入 **Workers & Pages → Create → Create Worker**，设置名称并部署默认模板。
2. 打开新 Worker 的 **Edit code** 界面，删除占位代码，粘贴入 `worker.js` 的完整内容，然后点击 **Deploy**。
3. 进入 **Workers & Pages → D1 → Create database**，设置名称（例如 `tg-multitool-db`）并创建。
4. 打开该数据库的 **Console** 标签页，粘贴入 `schema.sql` 的完整内容并执行，以创建所需的表。
5. 返回你的 Worker，进入 **Settings → Bindings → Add binding → D1 database**，将变量名设为 `DB`，并选择刚创建的数据库，保存。
6. 进入 **Settings → Variables and Secrets** 并添加：
   | 名称 | 类型 | 值 |
   | --- | --- | --- |
   | `BOT_TOKEN` | Secret | 来自 `@BotFather` 的机器人令牌 |
   | `ADMIN_IDS` | Text | 逗号分隔的管理员数字 ID，例如 `111111111,222222222` |
7. 进入 **Settings → Triggers → Cron Triggers → Add Cron Trigger**，添加一个计划任务，例如 `*/5 * * * *`（用于投递定时消息）。
8. 在浏览器中打开一次你的 Worker 地址（`https://your-worker.workers.dev/`）——它会自动验证并设置 Telegram Webhook。

### 🔌 启用 Inline Mode（必需）

> ⚠️ **此步骤无法通过代码或控制台完成，必须在 BotFather 中手动开启。** 否则 **分享（Share）** 按钮将无法正常工作，在任意聊天中点击它也不会出现消息预览。

1. 打开与 [@BotFather](https://t.me/BotFather) 的对话。
2. 发送 `/mybots` 并选择你的机器人。
3. 进入 **Bot Settings → Inline Mode → Turn on**。
4. （可选）设置在使用内联模式时聊天输入框中显示的提示文字。

### ⚙️ 配置

| 变量        | 类型     | 是否必需 | 说明                                       |
| ----------- | -------- | -------- | ------------------------------------------ |
| `BOT_TOKEN` | Secret   | 是       | 来自 `@BotFather` 的机器人令牌              |
| `ADMIN_IDS` | Var      | 是       | 逗号分隔的数字 Telegram ID，拥有管理面板权限 |
| `DB`        | Binding  | 是       | 用于所有存储的 D1 数据库绑定                |

### ▶️ 使用方法

- `/start` — 选择语言并打开主菜单
- `/lang` — 随时切换语言
- **创建消息** → 构建内容与按钮 → 获取分享代码
- **无引用发送** → 粘贴代码 → 选择已保存或新的目标
- **我的频道/群组** → 保存目标以便一键发送
- **查找数字 ID** → 通过用户名、转发消息或 `/id`、`/myid`
- **管理面板**（仅限管理员）→ 群发广播、统计、强制加群锁定、钱包

### 🈺 支持的语言

🇬🇧 英语 · 🇮🇷 波斯语 · 🇷🇺 俄语 · 🇸🇦 阿拉伯语 · 🇪🇸 西班牙语 · 🇨🇳 中文 · 🇮🇳 印地语 · 🇫🇷 法语 · 🇩🇪 德语 · 🇯🇵 日语 · 🇹🇷 土耳其语 · 🇵🇹 葡萄牙语 · 🇧🇩 孟加拉语 · 🇵🇰 乌尔都语 · 🇮🇩 印尼语

---

## 📄 License / مجوز / Лицензия / 许可证

This project is licensed under the **MIT License**. / این پروژه تحت **مجوز MIT** منتشر شده است. / Этот проект распространяется под лицензией **MIT**. / 本项目采用 **MIT 许可证** 授权。
