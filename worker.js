/**
 * Telegram Multi-Tool Bot — Cloudflare Workers + D1
 * -----------------------------------------------------
 * https://github.com/netrair/TGMultiTool Features:
 *  - 5 languages (en, fa, ru, ar, es) with flags, chosen on /start (change anytime with /lang)
 *  - Message builder: send any message (unchanged), optionally attach colored glass
 *    buttons (Bot API 9.4 `style` field), get a reusable share CODE
 *  - "Send without quote": paste a code, pick/enter a target channel/group where the
 *    bot is admin, message is copied exactly (copyMessage, no "forwarded from" tag)
 *  - Saved channels/groups per user, offered as quick-pick buttons
 *  - Inline sharing: tap "Share" to send the saved message into ANY chat via
 *    Telegram's inline mode (switch_inline_query + answerInlineQuery)
 *  - Numeric ID finder (username / forwarded message / self / group `/id` command)
 *  - Admin panel: broadcast, stats, join-lock channels, wallet (network + address)
 *  - Support/Donate button showing the admin-configured wallet
 * Deploy: see README.md 
 */

// Bump this string whenever you deploy, then check https://YOUR-WORKER/version
// to confirm the dashboard editor actually saved your latest paste.
const _v1 = "2026-09-17-d1";

// ============================================================
//  I18N
// ============================================================
const _v2 = ["en", "fa", "ru", "ar", "es", "zh", "hi", "fr", "de", "ja", "tr", "pt", "bn", "ur", "id"];
const _v3 = {
  en: "English 🇬🇧",
  fa: "فارسی 🇮🇷",
  ru: "Русский 🇷🇺",
  ar: "العربية 🇸🇦",
  es: "Español 🇪🇸",
  zh: "中文 🇨🇳",
  hi: "हिन्दी 🇮🇳",
  fr: "Français 🇫🇷",
  de: "Deutsch 🇩🇪",
  ja: "日本語 🇯🇵",
  tr: "Türkçe 🇹🇷",
  pt: "Português 🇵🇹",
  bn: "বাংলা 🇧🇩",
  ur: "اردو 🇵🇰",
  id: "Bahasa Indonesia 🇮🇩",
};

const _v4 = {
  en: {
    choose_lang: "🌐 Choose your language:",
    lang_changed: "✅ Language updated.",
    main_menu_title: "✨ Main menu — choose a tool:",
    btn_create: "🧩 Create message",
    btn_send: "📤 Send without quote",
    btn_mychats: "🗂 My channels/groups",
    btn_idfinder: "🆔 Find numeric ID",
    btn_support: "💛 Support the bot",
    btn_admin: "🛠 Admin panel",
    btn_back: "🔙 Back",
    btn_cancel: "✖️ Cancel",
    btn_skip: "⏭ Skip",
    btn_yes: "✅ Yes",
    btn_no: "❌ No",
    cancelled: "Cancelled.",

    create_ask_content: "Send me the message you want (text, photo, video, file, …) exactly as you want it delivered — it will never be altered.",
    create_ask_buttons: "Want to attach glass buttons? Send them like this (button text on one line, link on the next):\n\nLink 1\nhttps://link1.com\nLink 2\nhttps://link2.com\n\nOr tap Skip if you don't need buttons.",
    create_invalid_buttons: "⚠️ Wrong format. Each button needs 2 lines: text, then a link starting with http(s)://. Try again, or Skip.",
    btn_pick_color: "Pick a color for this button:\n«{text}»",
    color_primary: "🔵 Primary",
    color_success: "🟢 Success",
    color_danger: "🔴 Danger",
    color_default: "⚪️ Default",
    create_more_buttons_q: "Add another button?",
    create_done: "✅ Your message is ready!\n\n🔑 Message code:\n<code>{code}</code>\n\nKeep this code — use \"Send without quote\" anytime to deliver this exact message to any channel/group the bot administers. The same code also lets you check its stats, edit its buttons, or delete it (buttons below).",
    share_btn: "🔗 Share",
    send_now_btn: "📤 Send without quote",
    schedule_send_btn: "⏰ Schedule send",
    schedule_ask_hours: "Send the number of hours from now after which this message should be sent (e.g. 2 or 0.5):",
    schedule_invalid_hours: "⚠️ Please send a valid positive number of hours (e.g. 1, 2.5, 24). Max 720.",
    schedule_confirmed: "✅ Scheduled! This message will be sent to «{target}» in {hours}h, around {time}.",
    schedule_delivered: "✅ Your scheduled message was delivered to «{target}».",
    schedule_failed: "❗️ Failed to deliver your scheduled message to «{target}» (maybe the bot is no longer admin there).",

    send_ask_code: "Send the message code you want to deliver:",
    send_code_not_found: "❗️ Code not found. Please check and send it again.",
    send_choose_target: "Where should this be sent?",
    send_enter_id_btn: "✏️ Enter a new ID/username",
    send_ask_target: "Send the numeric ID or @username of the channel/group where the bot is admin:",
    send_not_admin_there: "❗️ The bot isn't an admin there. Add the bot as admin to that channel/group first, then try again.",
    send_success: "✅ Message delivered successfully.",
    send_save_target_q: "Save this channel/group for next time?",

    mychats_title: "🗂 Your saved channels/groups:",
    mychats_empty: "Nothing saved yet.",
    mychats_add_btn: "➕ Add",
    mychats_remove_btn: "❌ Remove",
    mychats_add_ask: "Send the numeric ID or @username of the channel/group (the bot must be admin there):",
    mychats_added: "✅ Saved: {title}",
    mychats_removed: "✅ Removed.",
    mychats_not_admin: "❗️ The bot isn't an admin there yet.",

    id_ask: "🆔 Find a numeric ID\n\n• Public channel/group/user with a @username → just send @username.\n• Private user → forward any of their messages to me here (if they haven't hidden forwarding info).\n• Yourself → tap the button below, or send /myid anytime.\n• Private group/channel without a username → add me to it as admin, then send /id inside that group/channel and I'll reply with its numeric ID.\n• Or just forward me any message from that chat.",
    id_myid_btn: "🙋 My own ID",
    id_user_result: "👤 User\nID: <code>{id}</code>\nName: {name}\nUsername: {username}",
    id_chat_result: "📢 Chat\nID: <code>{id}</code>\nType: {type}\nTitle: {title}",
    id_not_found: "❗️ Could not find that ID. Make sure the username is correct and public, or forward a message with forwarding info visible.",
    id_forward_hidden: "❗️ This user hid their account when forwarding, so Telegram doesn't give bots their ID (their own privacy setting).",
    id_group_reply: "🆔 This chat's ID:\n<code>{id}</code>\nType: {type}",

    admin_panel_title: "🛠 Admin panel:",
    btn_broadcast: "📢 Broadcast",
    btn_stats: "📊 Statistics",
    btn_locks: "🔒 Join-lock channels",
    btn_wallet: "💳 Wallet",
    btn_wallet_edit: "✏️ Set / change wallet",
    broadcast_ask: "Send the message you want to broadcast to all users (any type).",
    broadcast_confirm: "Send this to all users now?",
    broadcast_sending: "⏳ Sending… this may take a while.",
    broadcast_done: "✅ Broadcast finished.\nSent: {sent}\nFailed: {failed}",
    stats_title: "📊 Bot statistics\n\n👥 Users: {users}\n💬 Messages processed: {messages}\n🔒 Active locks: {locks}\n💳 Wallet set: {wallet}",
    locks_title: "🔒 Join-lock channels/groups\nUsers must join all of these before using the bot.",
    locks_add_btn: "➕ Add lock",
    locks_remove_btn: "❌ Remove",
    locks_add_ask: "Forward a message from the channel/group, or send its @username / numeric ID.\n⚠️ The bot must be an admin there.",
    locks_added: "✅ Lock added: {title}",
    locks_removed: "✅ Lock removed.",
    locks_empty: "No locks configured yet.",
    wallet_title: "💳 Current wallet:\n\nNetwork/coin: {network}\nAddress: <code>{address}</code>",
    wallet_not_set: "💳 No wallet has been set yet.",
    wallet_ask_network: "Send the network/coin name (e.g. TON, TRC20 USDT, BTC):",
    wallet_ask_address: "Now send the deposit address for «{network}»:",
    wallet_saved: "✅ Wallet saved.",
    support_title: "💛 Support this bot",
    support_text: "If you like this bot, you can support development with a donation:\n\nNetwork/coin: {network}\nAddress: <code>{address}</code>\n\nThank you! 🙏",
    support_no_wallet: "The admin hasn't set a donation wallet yet.",
    not_admin: "⛔️ You are not an admin.",
    join_required_title: "🔒 To use this bot you must first join the following:",
    join_check_btn: "✅ I joined, check again",
    join_still_missing: "❗️ You still haven't joined all required channels/groups.",
    btn_stats_code: "📊 Stats",
    btn_edit_buttons: "✏️ Edit buttons",
    btn_delete_code: "🗑 Delete",
    code_stats_title: "📊 Message stats\n\nDirect sends: {sent}\nButtons: {buttons}\nCreated: {created}",
    code_deleted: "✅ Message deleted. The code no longer works.",
    code_not_owner: "⛔️ This message code doesn't belong to you.",
    code_gone: "❗️ This code no longer exists (maybe it was deleted).",
    view_message_btn: "🔗 View message",
    generic_error: "⚠️ Something went wrong. Please try again.",
  },
  fa: {
    choose_lang: "🌐 زبان خود را انتخاب کنید:",
    lang_changed: "✅ زبان تغییر کرد.",
    main_menu_title: "✨ منوی اصلی — یک ابزار انتخاب کنید:",
    btn_create: "🧩 ساخت پیام",
    btn_send: "📤 ارسال بدون نقل قول",
    btn_mychats: "🗂 کانال/گروه‌های من",
    btn_idfinder: "🆔 پیدا کردن آیدی عددی",
    btn_support: "💛 حمایت از ربات",
    btn_admin: "🛠 پنل مدیریت",
    btn_back: "🔙 بازگشت",
    btn_cancel: "✖️ انصراف",
    btn_skip: "⏭ رد کردن",
    btn_yes: "✅ بله",
    btn_no: "❌ خیر",
    cancelled: "لغو شد.",

    create_ask_content: "پیامی که می‌خواهید (متن، عکس، ویدیو، فایل و ...) را دقیقاً همان‌طور که می‌خواهید ارسال شود برایم بفرستید — هیچ تغییری در آن داده نخواهد شد.",
    create_ask_buttons: "اگر می‌خواهید دکمه‌ی شیشه‌ای اضافه کنید، به این فرمت بفرستید (خط اول متن دکمه، خط بعدی لینک آن):\n\nلینک 1\nhttps://link1.com\nلینک 2\nhttps://link2.com\n\nاگر دکمه نمی‌خواهید، «رد کردن» را بزنید.",
    create_invalid_buttons: "⚠️ فرمت درست نیست. هر دکمه باید ۲ خط باشد: متن دکمه، سپس لینک با http:// یا https://. دوباره امتحان کنید یا «رد کردن» را بزنید.",
    btn_pick_color: "رنگ این دکمه را انتخاب کنید:\n«{text}»",
    color_primary: "🔵 آبی (Primary)",
    color_success: "🟢 سبز (Success)",
    color_danger: "🔴 قرمز (Danger)",
    color_default: "⚪️ پیش‌فرض",
    create_more_buttons_q: "دکمه‌ی دیگری هم اضافه می‌کنید؟",
    create_done: "✅ پیام شما ساخته شد!\n\n🔑 کد پیغام شما:\n<code>{code}</code>\n\nاین کد را نگه دارید؛ هر زمان خواستید از «ارسال بدون نقل قول» با همین کد، پیام را دقیقاً همین‌طوری به هر کانال یا گروهی که ربات در آن ادمین است ارسال کنید. با همین کد می‌توانید آمارش را ببینید، دکمه‌هایش را ویرایش کنید یا حذفش کنید (دکمه‌های زیر).",
    share_btn: "🔗 به اشتراک بگذارید",
    send_now_btn: "📤 ارسال بدون نقل قول",
    schedule_send_btn: "⏰ ارسال با زمان‌بندی",
    schedule_ask_hours: "عدد ساعت را بفرستید تا این پیام بعد از آن مدت ارسال شود (مثلاً 2 یا 0.5):",
    schedule_invalid_hours: "⚠️ لطفاً یک عدد معتبر و مثبت برای ساعت بفرستید (مثلاً 1، 2.5، 24). حداکثر 720.",
    schedule_confirmed: "✅ زمان‌بندی شد! این پیام تا {hours} ساعت دیگر (حدود {time}) به «{target}» ارسال خواهد شد.",
    schedule_delivered: "✅ پیام زمان‌بندی‌شده‌ی شما به «{target}» ارسال شد.",
    schedule_failed: "❗️ ارسال پیام زمان‌بندی‌شده به «{target}» ناموفق بود (شاید ربات دیگر در آنجا ادمین نیست).",

    send_ask_code: "کد پیغامی که می‌خواهید ارسال شود را بفرستید:",
    send_code_not_found: "❗️ این کد پیدا نشد. لطفاً دوباره بررسی و ارسال کنید.",
    send_choose_target: "این پیام به کجا ارسال شود؟",
    send_enter_id_btn: "✏️ وارد کردن آیدی/یوزرنیم جدید",
    send_ask_target: "آیدی عددی یا یوزرنیم (@) کانال یا گروهی که ربات در آن ادمین است را بفرستید:",
    send_not_admin_there: "❗️ ربات در آن چت ادمین نیست. اول ربات را در آن کانال/گروه ادمین کنید، بعد دوباره امتحان کنید.",
    send_success: "✅ پیام با موفقیت ارسال شد.",
    send_save_target_q: "می‌خواهید این کانال/گروه را برای دفعات بعد ذخیره کنید؟",

    mychats_title: "🗂 کانال/گروه‌های ثبت‌شده‌ی شما:",
    mychats_empty: "هنوز چیزی ثبت نکرده‌اید.",
    mychats_add_btn: "➕ افزودن",
    mychats_remove_btn: "❌ حذف",
    mychats_add_ask: "آیدی عددی یا یوزرنیم (@) کانال یا گروهی که ربات در آن ادمین است را بفرستید:",
    mychats_added: "✅ ثبت شد: {title}",
    mychats_removed: "✅ حذف شد.",
    mychats_not_admin: "❗️ ربات هنوز در آن‌جا ادمین نیست.",

    id_ask: "🆔 پیدا کردن آیدی عددی\n\n• کانال/گروه/شخصی که یوزرنیم عمومی دارد → کافیست @یوزرنیم را بفرستید.\n• یک شخص خصوصی → یکی از پیام‌های او را برایم فوروارد کنید (اگر اطلاعات فوروارد را مخفی نکرده باشد).\n• آیدی خودتان → دکمه‌ی زیر را بزنید، یا هر زمان دستور /myid را بفرستید.\n• گروه یا کانال خصوصی بدون یوزرنیم → ربات را در آن ادمین کنید، بعد داخل همان گروه/کانال دستور /id را بفرستید تا آیدی عددی‌اش را بگویم.\n• یا می‌توانید یک پیام از همان چت را برای من فوروارد کنید.",
    id_myid_btn: "🙋 آیدی خودم",
    id_user_result: "👤 کاربر\nآیدی: <code>{id}</code>\nنام: {name}\nیوزرنیم: {username}",
    id_chat_result: "📢 چت\nآیدی: <code>{id}</code>\nنوع: {type}\nعنوان: {title}",
    id_not_found: "❗️ آیدی پیدا نشد. مطمئن شوید یوزرنیم درست و عمومی است، یا پیامی را فوروارد کنید که اطلاعات فوروارد آن مخفی نشده باشد.",
    id_forward_hidden: "❗️ این کاربر هنگام فوروارد، حساب خود را مخفی کرده و تلگرام آیدی او را در اختیار ربات‌ها قرار نمی‌دهد (تنظیمات حریم خصوصی خودِ کاربر است).",
    id_group_reply: "🆔 آیدی عددی این چت:\n<code>{id}</code>\nنوع: {type}",

    admin_panel_title: "🛠 پنل مدیریت:",
    btn_broadcast: "📢 ارسال همگانی",
    btn_stats: "📊 آمار ربات",
    btn_locks: "🔒 قفل عضویت کانال/گروه",
    btn_wallet: "💳 کیف پول",
    btn_wallet_edit: "✏️ تنظیم / تغییر آدرس کیف پول",
    broadcast_ask: "پیامی که می‌خواهید برای همه‌ی کاربران ارسال شود را بفرستید (هر نوع پیامی).",
    broadcast_confirm: "این پیام برای همه‌ی کاربران ارسال شود؟",
    broadcast_sending: "⏳ در حال ارسال… ممکن است کمی طول بکشد.",
    broadcast_done: "✅ ارسال همگانی تمام شد.\nموفق: {sent}\nناموفق: {failed}",
    stats_title: "📊 آمار ربات\n\n👥 تعداد کاربران: {users}\n💬 پیام‌های پردازش شده: {messages}\n🔒 قفل‌های فعال: {locks}\n💳 کیف پول تنظیم شده: {wallet}",
    locks_title: "🔒 کانال/گروه‌های قفل عضویت\nکاربران باید همه‌ی این‌ها را عضو شوند تا بتوانند از ربات استفاده کنند.",
    locks_add_btn: "➕ افزودن قفل",
    locks_remove_btn: "❌ حذف",
    locks_add_ask: "یک پیام از کانال/گروه فوروارد کنید یا @یوزرنیم / آیدی عددی آن را بفرستید.\n⚠️ ربات باید در آن ادمین باشد.",
    locks_added: "✅ قفل اضافه شد: {title}",
    locks_removed: "✅ قفل حذف شد.",
    locks_empty: "هنوز قفلی تنظیم نشده است.",
    wallet_title: "💳 کیف پول فعلی:\n\nشبکه/ارز: {network}\nآدرس: <code>{address}</code>",
    wallet_not_set: "💳 هنوز کیف پولی تنظیم نشده است.",
    wallet_ask_network: "نام شبکه یا ارز را وارد کنید (مثلاً TON، TRC20 USDT، BTC):",
    wallet_ask_address: "حالا آدرس واریز برای شبکه‌ی «{network}» را بفرستید:",
    wallet_saved: "✅ اطلاعات کیف پول ذخیره شد.",
    support_title: "💛 حمایت از ربات",
    support_text: "اگر این ربات را دوست دارید، می‌توانید از توسعه‌ی آن حمایت کنید:\n\nشبکه/ارز: {network}\nآدرس: <code>{address}</code>\n\nممنون از شما! 🙏",
    support_no_wallet: "ادمین هنوز کیف پولی برای حمایت تنظیم نکرده است.",
    not_admin: "⛔️ شما ادمین نیستید.",
    join_required_title: "🔒 برای استفاده از ربات ابتدا باید در موارد زیر عضو شوید:",
    join_check_btn: "✅ عضو شدم، بررسی مجدد",
    join_still_missing: "❗️ هنوز در همه‌ی کانال/گروه‌های لازم عضو نشده‌اید.",
    btn_stats_code: "📊 آمار",
    btn_edit_buttons: "✏️ ویرایش دکمه‌ها",
    btn_delete_code: "🗑 حذف",
    code_stats_title: "📊 آمار پیام\n\nتعداد ارسال مستقیم: {sent}\nتعداد دکمه‌ها: {buttons}\nتاریخ ساخت: {created}",
    code_deleted: "✅ پیام حذف شد. این کد از این پس کار نمی‌کند.",
    code_not_owner: "⛔️ این کد پیام متعلق به شما نیست.",
    code_gone: "❗️ این کد دیگر وجود ندارد (شاید حذف شده).",
    view_message_btn: "🔗 مشاهده پیام",
    generic_error: "⚠️ خطایی رخ داد. دوباره تلاش کنید.",
  },
  ru: {
    choose_lang: "🌐 Выберите язык:",
    lang_changed: "✅ Язык изменён.",
    main_menu_title: "✨ Главное меню — выберите инструмент:",
    btn_create: "🧩 Создать сообщение",
    btn_send: "📤 Отправить без цитаты",
    btn_mychats: "🗂 Мои каналы/группы",
    btn_idfinder: "🆔 Найти числовой ID",
    btn_support: "💛 Поддержать бота",
    btn_admin: "🛠 Панель администратора",
    btn_back: "🔙 Назад",
    btn_cancel: "✖️ Отмена",
    btn_skip: "⏭ Пропустить",
    btn_yes: "✅ Да",
    btn_no: "❌ Нет",
    cancelled: "Отменено.",

    create_ask_content: "Отправьте сообщение, которое хотите (текст, фото, видео, файл…) — оно не будет изменено.",
    create_ask_buttons: "Хотите добавить кнопки? Отправьте в формате (текст кнопки, затем ссылка на новой строке):\n\nСсылка 1\nhttps://link1.com\nСсылка 2\nhttps://link2.com\n\nИли нажмите «Пропустить».",
    create_invalid_buttons: "⚠️ Неверный формат. Каждая кнопка — 2 строки: текст и ссылка (http/https). Попробуйте снова.",
    btn_pick_color: "Выберите цвет кнопки:\n«{text}»",
    color_primary: "🔵 Primary",
    color_success: "🟢 Success",
    color_danger: "🔴 Danger",
    color_default: "⚪️ Обычная",
    create_more_buttons_q: "Добавить ещё одну кнопку?",
    create_done: "✅ Сообщение готово!\n\n🔑 Код сообщения:\n<code>{code}</code>\n\nСохраните этот код — используйте «Отправить без цитаты», чтобы доставить это сообщение в любой администрируемый ботом канал/группу. Этот же код позволяет посмотреть статистику, изменить кнопки или удалить сообщение (кнопки ниже).",
    share_btn: "🔗 Поделиться",
    send_now_btn: "📤 Отправить без цитаты",
    schedule_send_btn: "⏰ Запланировать отправку",
    schedule_ask_hours: "Через сколько часов отправить это сообщение? Отправьте число (например 2 или 0.5):",
    schedule_invalid_hours: "⚠️ Отправьте корректное положительное число часов (например 1, 2.5, 24). Максимум 720.",
    schedule_confirmed: "✅ Запланировано! Сообщение будет отправлено в «{target}» через {hours} ч., примерно в {time}.",
    schedule_delivered: "✅ Ваше запланированное сообщение доставлено в «{target}».",
    schedule_failed: "❗️ Не удалось доставить запланированное сообщение в «{target}» (возможно, бот больше не администратор там).",

    send_ask_code: "Отправьте код сообщения:",
    send_code_not_found: "❗️ Код не найден. Проверьте и отправьте снова.",
    send_choose_target: "Куда отправить?",
    send_enter_id_btn: "✏️ Ввести новый ID/username",
    send_ask_target: "Отправьте числовой ID или @username канала/группы, где бот админ:",
    send_not_admin_there: "❗️ Бот там не администратор. Сначала сделайте бота админом, затем повторите.",
    send_success: "✅ Сообщение успешно отправлено.",
    send_save_target_q: "Сохранить этот канал/группу на будущее?",

    mychats_title: "🗂 Ваши сохранённые каналы/группы:",
    mychats_empty: "Пока ничего не сохранено.",
    mychats_add_btn: "➕ Добавить",
    mychats_remove_btn: "❌ Удалить",
    mychats_add_ask: "Отправьте числовой ID или @username (бот должен быть там админом):",
    mychats_added: "✅ Сохранено: {title}",
    mychats_removed: "✅ Удалено.",
    mychats_not_admin: "❗️ Бот пока не администратор там.",

    id_ask: "🆔 Поиск числового ID\n\n• Публичный канал/группа/пользователь с @username → отправьте @username.\n• Приватный пользователь → перешлите его сообщение мне.\n• Вы сами → нажмите кнопку ниже или отправьте /myid.\n• Приватная группа/канал без username → добавьте бота админом и отправьте там /id.\n• Или перешлите сообщение из этого чата.",
    id_myid_btn: "🙋 Мой ID",
    id_user_result: "👤 Пользователь\nID: <code>{id}</code>\nИмя: {name}\nUsername: {username}",
    id_chat_result: "📢 Чат\nID: <code>{id}</code>\nТип: {type}\nНазвание: {title}",
    id_not_found: "❗️ ID не найден. Проверьте username, или перешлите сообщение с видимой информацией о пересылке.",
    id_forward_hidden: "❗️ Этот пользователь скрыл аккаунт при пересылке, поэтому Telegram не передаёт его ID ботам.",
    id_group_reply: "🆔 ID этого чата:\n<code>{id}</code>\nТип: {type}",

    admin_panel_title: "🛠 Панель администратора:",
    btn_broadcast: "📢 Рассылка",
    btn_stats: "📊 Статистика",
    btn_locks: "🔒 Обязательные каналы",
    btn_wallet: "💳 Кошелёк",
    btn_wallet_edit: "✏️ Задать / изменить кошелёк",
    broadcast_ask: "Отправьте сообщение для рассылки всем пользователям.",
    broadcast_confirm: "Отправить это всем пользователям?",
    broadcast_sending: "⏳ Отправка… это может занять время.",
    broadcast_done: "✅ Рассылка завершена.\nУспешно: {sent}\nНе удалось: {failed}",
    stats_title: "📊 Статистика бота\n\n👥 Пользователей: {users}\n💬 Обработано сообщений: {messages}\n🔒 Активных блокировок: {locks}\n💳 Кошелёк установлен: {wallet}",
    locks_title: "🔒 Обязательные каналы/группы\nПользователи должны подписаться на все из них.",
    locks_add_btn: "➕ Добавить",
    locks_remove_btn: "❌ Удалить",
    locks_add_ask: "Перешлите сообщение из канала/группы или отправьте его @username / числовой ID.\n⚠️ Бот должен быть там администратором.",
    locks_added: "✅ Добавлено: {title}",
    locks_removed: "✅ Удалено.",
    locks_empty: "Пока ничего не настроено.",
    wallet_title: "💳 Текущий кошелёк:\n\nСеть/монета: {network}\nАдрес: <code>{address}</code>",
    wallet_not_set: "💳 Кошелёк ещё не установлен.",
    wallet_ask_network: "Отправьте название сети/монеты (например TON, TRC20 USDT, BTC):",
    wallet_ask_address: "Теперь отправьте адрес для «{network}»:",
    wallet_saved: "✅ Кошелёк сохранён.",
    support_title: "💛 Поддержать бота",
    support_text: "Если вам нравится этот бот, поддержите разработку донатом:\n\nСеть/монета: {network}\nАдрес: <code>{address}</code>\n\nСпасибо! 🙏",
    support_no_wallet: "Администратор ещё не установил кошелёк для донатов.",
    not_admin: "⛔️ Вы не администратор.",
    join_required_title: "🔒 Чтобы использовать бота, сначала подпишитесь на следующее:",
    join_check_btn: "✅ Я подписался, проверить снова",
    join_still_missing: "❗️ Вы ещё не подписались на все необходимые каналы/группы.",
    btn_stats_code: "📊 Статистика",
    btn_edit_buttons: "✏️ Изменить кнопки",
    btn_delete_code: "🗑 Удалить",
    code_stats_title: "📊 Статистика сообщения\n\nПрямых отправок: {sent}\nКнопок: {buttons}\nСоздано: {created}",
    code_deleted: "✅ Сообщение удалено. Код больше не работает.",
    code_not_owner: "⛔️ Этот код сообщения вам не принадлежит.",
    code_gone: "❗️ Этот код больше не существует.",
    view_message_btn: "🔗 Посмотреть сообщение",
    generic_error: "⚠️ Что-то пошло не так. Попробуйте снова.",
  },
  ar: {
    choose_lang: "🌐 اختر لغتك:",
    lang_changed: "✅ تم تغيير اللغة.",
    main_menu_title: "✨ القائمة الرئيسية — اختر أداة:",
    btn_create: "🧩 إنشاء رسالة",
    btn_send: "📤 إرسال بدون اقتباس",
    btn_mychats: "🗂 قنواتي/مجموعاتي",
    btn_idfinder: "🆔 العثور على المعرّف الرقمي",
    btn_support: "💛 دعم البوت",
    btn_admin: "🛠 لوحة الإدارة",
    btn_back: "🔙 رجوع",
    btn_cancel: "✖️ إلغاء",
    btn_skip: "⏭ تخطي",
    btn_yes: "✅ نعم",
    btn_no: "❌ لا",
    cancelled: "تم الإلغاء.",

    create_ask_content: "أرسل لي الرسالة التي تريدها (نص، صورة، فيديو، ملف...) كما تريدها بالضبط — لن يتم تغييرها أبدًا.",
    create_ask_buttons: "هل تريد إضافة أزرار زجاجية؟ أرسلها بهذا الشكل (نص الزر ثم الرابط في السطر التالي):\n\nرابط 1\nhttps://link1.com\nرابط 2\nhttps://link2.com\n\nأو اضغط «تخطي» إذا لم ترد أزرارًا.",
    create_invalid_buttons: "⚠️ صيغة خاطئة. كل زر يحتاج سطرين: النص ثم رابط يبدأ بـ http(s)://. حاول مجددًا أو اضغط تخطي.",
    btn_pick_color: "اختر لون هذا الزر:\n«{text}»",
    color_primary: "🔵 أساسي",
    color_success: "🟢 نجاح",
    color_danger: "🔴 خطر",
    color_default: "⚪️ افتراضي",
    create_more_buttons_q: "هل تريد إضافة زر آخر؟",
    create_done: "✅ رسالتك جاهزة!\n\n🔑 كود الرسالة:\n<code>{code}</code>\n\nاحتفظ بهذا الكود — استخدم «إرسال بدون اقتباس» في أي وقت لإرسال هذه الرسالة كما هي لأي قناة/مجموعة يديرها البوت. بنفس الكود يمكنك عرض الإحصائيات أو تعديل الأزرار أو حذف الرسالة (الأزرار أدناه).",
    share_btn: "🔗 مشاركة",
    send_now_btn: "📤 إرسال بدون اقتباس",
    schedule_send_btn: "⏰ جدولة الإرسال",
    schedule_ask_hours: "أرسل عدد الساعات من الآن ليتم إرسال هذه الرسالة بعدها (مثلاً 2 أو 0.5):",
    schedule_invalid_hours: "⚠️ يرجى إرسال رقم صحيح موجب للساعات (مثلاً 1، 2.5، 24). الحد الأقصى 720.",
    schedule_confirmed: "✅ تمت الجدولة! سيتم إرسال هذه الرسالة إلى «{target}» خلال {hours} ساعة، تقريباً الساعة {time}.",
    schedule_delivered: "✅ تم تسليم رسالتك المجدولة إلى «{target}».",
    schedule_failed: "❗️ فشل تسليم رسالتك المجدولة إلى «{target}» (ربما لم يعد البوت مشرفاً هناك).",

    send_ask_code: "أرسل كود الرسالة التي تريد إرسالها:",
    send_code_not_found: "❗️ لم يتم العثور على الكود. تحقق وأعد الإرسال.",
    send_choose_target: "أين تريد إرسال هذه الرسالة؟",
    send_enter_id_btn: "✏️ إدخال معرّف/اسم مستخدم جديد",
    send_ask_target: "أرسل المعرّف الرقمي أو @username للقناة/المجموعة التي يديرها البوت:",
    send_not_admin_there: "❗️ البوت ليس مشرفًا هناك. أضف البوت كمشرف أولاً ثم حاول مجددًا.",
    send_success: "✅ تم إرسال الرسالة بنجاح.",
    send_save_target_q: "هل تريد حفظ هذه القناة/المجموعة للمرات القادمة؟",

    mychats_title: "🗂 قنواتك/مجموعاتك المحفوظة:",
    mychats_empty: "لا يوجد شيء محفوظ بعد.",
    mychats_add_btn: "➕ إضافة",
    mychats_remove_btn: "❌ حذف",
    mychats_add_ask: "أرسل المعرّف الرقمي أو @username (يجب أن يكون البوت مشرفًا هناك):",
    mychats_added: "✅ تم الحفظ: {title}",
    mychats_removed: "✅ تم الحذف.",
    mychats_not_admin: "❗️ البوت ليس مشرفًا هناك بعد.",

    id_ask: "🆔 العثور على المعرّف الرقمي\n\n• قناة/مجموعة/مستخدم لديه @username عام → أرسل @username فقط.\n• مستخدم خاص → أعد توجيه إحدى رسائله لي.\n• أنت نفسك → اضغط الزر أدناه أو أرسل /myid.\n• مجموعة/قناة خاصة بدون username → أضف البوت كمشرف ثم أرسل /id داخلها.\n• أو أعد توجيه رسالة من تلك المحادثة.",
    id_myid_btn: "🙋 معرّفي أنا",
    id_user_result: "👤 مستخدم\nالمعرّف: <code>{id}</code>\nالاسم: {name}\nUsername: {username}",
    id_chat_result: "📢 محادثة\nالمعرّف: <code>{id}</code>\nالنوع: {type}\nالعنوان: {title}",
    id_not_found: "❗️ لم يتم العثور على المعرّف. تأكد من صحة اسم المستخدم، أو أعد توجيه رسالة تظهر فيها معلومات إعادة التوجيه.",
    id_forward_hidden: "❗️ قام هذا المستخدم بإخفاء حسابه عند إعادة التوجيه، لذلك لا يمنح تيليجرام البوتات معرّفه.",
    id_group_reply: "🆔 معرّف هذه المحادثة:\n<code>{id}</code>\nالنوع: {type}",

    admin_panel_title: "🛠 لوحة الإدارة:",
    btn_broadcast: "📢 رسالة جماعية",
    btn_stats: "📊 الإحصائيات",
    btn_locks: "🔒 قنوات الاشتراك الإجباري",
    btn_wallet: "💳 المحفظة",
    btn_wallet_edit: "✏️ ضبط / تغيير المحفظة",
    broadcast_ask: "أرسل الرسالة التي تريد إرسالها لجميع المستخدمين.",
    broadcast_confirm: "هل ترسل هذا لجميع المستخدمين الآن؟",
    broadcast_sending: "⏳ جارٍ الإرسال… قد يستغرق ذلك بعض الوقت.",
    broadcast_done: "✅ اكتمل الإرسال الجماعي.\nنجح: {sent}\nفشل: {failed}",
    stats_title: "📊 إحصائيات البوت\n\n👥 المستخدمون: {users}\n💬 الرسائل المعالجة: {messages}\n🔒 القيود النشطة: {locks}\n💳 المحفظة مضبوطة: {wallet}",
    locks_title: "🔒 قنوات/مجموعات الاشتراك الإجباري\nيجب على المستخدمين الانضمام إلى جميعها لاستخدام البوت.",
    locks_add_btn: "➕ إضافة قيد",
    locks_remove_btn: "❌ حذف",
    locks_add_ask: "أعد توجيه رسالة من القناة/المجموعة أو أرسل @username / المعرّف الرقمي.\n⚠️ يجب أن يكون البوت مشرفًا هناك.",
    locks_added: "✅ تمت إضافة القيد: {title}",
    locks_removed: "✅ تم حذف القيد.",
    locks_empty: "لا توجد قيود بعد.",
    wallet_title: "💳 المحفظة الحالية:\n\nالشبكة/العملة: {network}\nالعنوان: <code>{address}</code>",
    wallet_not_set: "💳 لم يتم ضبط محفظة بعد.",
    wallet_ask_network: "أرسل اسم الشبكة/العملة (مثل TON، TRC20 USDT، BTC):",
    wallet_ask_address: "الآن أرسل عنوان الإيداع لـ «{network}»:",
    wallet_saved: "✅ تم حفظ المحفظة.",
    support_title: "💛 دعم هذا البوت",
    support_text: "إذا أعجبك هذا البوت، يمكنك دعم تطويره بالتبرع:\n\nالشبكة/العملة: {network}\nالعنوان: <code>{address}</code>\n\nشكرًا لك! 🙏",
    support_no_wallet: "لم يقم المشرف بضبط محفظة للتبرعات بعد.",
    not_admin: "⛔️ لست مشرفًا.",
    join_required_title: "🔒 لاستخدام البوت يجب عليك أولاً الانضمام إلى التالي:",
    join_check_btn: "✅ انضممت، تحقق مرة أخرى",
    join_still_missing: "❗️ لم تنضم بعد إلى جميع القنوات/المجموعات المطلوبة.",
    btn_stats_code: "📊 إحصائيات",
    btn_edit_buttons: "✏️ تعديل الأزرار",
    btn_delete_code: "🗑 حذف",
    code_stats_title: "📊 إحصائيات الرسالة\n\nالإرسال المباشر: {sent}\nعدد الأزرار: {buttons}\nتاريخ الإنشاء: {created}",
    code_deleted: "✅ تم حذف الرسالة. لن يعمل هذا الكود بعد الآن.",
    code_not_owner: "⛔️ كود هذه الرسالة ليس ملكك.",
    code_gone: "❗️ هذا الكود لم يعد موجودًا.",
    view_message_btn: "🔗 عرض الرسالة",
    generic_error: "⚠️ حدث خطأ ما. حاول مرة أخرى.",
  },
  es: {
    choose_lang: "🌐 Elige tu idioma:",
    lang_changed: "✅ Idioma actualizado.",
    main_menu_title: "✨ Menú principal — elige una herramienta:",
    btn_create: "🧩 Crear mensaje",
    btn_send: "📤 Enviar sin cita",
    btn_mychats: "🗂 Mis canales/grupos",
    btn_idfinder: "🆔 Buscar ID numérico",
    btn_support: "💛 Apoyar al bot",
    btn_admin: "🛠 Panel de administración",
    btn_back: "🔙 Atrás",
    btn_cancel: "✖️ Cancelar",
    btn_skip: "⏭ Omitir",
    btn_yes: "✅ Sí",
    btn_no: "❌ No",
    cancelled: "Cancelado.",

    create_ask_content: "Envíame el mensaje que quieras (texto, foto, vídeo, archivo…) tal cual — nunca será modificado.",
    create_ask_buttons: "¿Quieres añadir botones? Envíalos así (texto del botón, luego el enlace en la siguiente línea):\n\nEnlace 1\nhttps://link1.com\nEnlace 2\nhttps://link2.com\n\nO pulsa «Omitir» si no quieres botones.",
    create_invalid_buttons: "⚠️ Formato incorrecto. Cada botón necesita 2 líneas: texto y enlace (http/https). Inténtalo de nuevo.",
    btn_pick_color: "Elige un color para este botón:\n«{text}»",
    color_primary: "🔵 Primario",
    color_success: "🟢 Éxito",
    color_danger: "🔴 Peligro",
    color_default: "⚪️ Predeterminado",
    create_more_buttons_q: "¿Añadir otro botón?",
    create_done: "✅ ¡Tu mensaje está listo!\n\n🔑 Código del mensaje:\n<code>{code}</code>\n\nGuarda este código — usa «Enviar sin cita» cuando quieras para entregar este mensaje tal cual a cualquier canal/grupo administrado por el bot. El mismo código te permite ver estadísticas, editar los botones o eliminar el mensaje (botones abajo).",
    share_btn: "🔗 Compartir",
    send_now_btn: "📤 Enviar sin cita",
    schedule_send_btn: "⏰ Enviar programado",
    schedule_ask_hours: "Envía el número de horas a partir de ahora para enviar este mensaje (p. ej. 2 o 0.5):",
    schedule_invalid_hours: "⚠️ Envía un número de horas válido y positivo (p. ej. 1, 2.5, 24). Máximo 720.",
    schedule_confirmed: "✅ ¡Programado! Este mensaje se enviará a «{target}» en {hours}h, alrededor de las {time}.",
    schedule_delivered: "✅ Tu mensaje programado se entregó a «{target}».",
    schedule_failed: "❗️ No se pudo entregar tu mensaje programado a «{target}» (quizá el bot ya no es admin allí).",

    send_ask_code: "Envía el código del mensaje que quieres enviar:",
    send_code_not_found: "❗️ Código no encontrado. Revísalo y envíalo de nuevo.",
    send_choose_target: "¿A dónde se debe enviar?",
    send_enter_id_btn: "✏️ Introducir un nuevo ID/usuario",
    send_ask_target: "Envía el ID numérico o @usuario del canal/grupo donde el bot es admin:",
    send_not_admin_there: "❗️ El bot no es admin ahí. Hazlo admin primero y vuelve a intentarlo.",
    send_success: "✅ Mensaje enviado correctamente.",
    send_save_target_q: "¿Guardar este canal/grupo para la próxima vez?",

    mychats_title: "🗂 Tus canales/grupos guardados:",
    mychats_empty: "Aún no hay nada guardado.",
    mychats_add_btn: "➕ Añadir",
    mychats_remove_btn: "❌ Eliminar",
    mychats_add_ask: "Envía el ID numérico o @usuario (el bot debe ser admin ahí):",
    mychats_added: "✅ Guardado: {title}",
    mychats_removed: "✅ Eliminado.",
    mychats_not_admin: "❗️ El bot todavía no es admin ahí.",

    id_ask: "🆔 Buscar un ID numérico\n\n• Canal/grupo/usuario con @usuario público → envía @usuario.\n• Usuario privado → reenvíame uno de sus mensajes.\n• Tú mismo → pulsa el botón de abajo o envía /myid.\n• Grupo/canal privado sin usuario → agrega el bot como admin y envía /id ahí dentro.\n• O reenvíame un mensaje de ese chat.",
    id_myid_btn: "🙋 Mi propio ID",
    id_user_result: "👤 Usuario\nID: <code>{id}</code>\nNombre: {name}\nUsuario: {username}",
    id_chat_result: "📢 Chat\nID: <code>{id}</code>\nTipo: {type}\nTítulo: {title}",
    id_not_found: "❗️ No se encontró el ID. Verifica el usuario, o reenvía un mensaje con la información de reenvío visible.",
    id_forward_hidden: "❗️ Este usuario ocultó su cuenta al reenviar, así que Telegram no da su ID a los bots.",
    id_group_reply: "🆔 ID de este chat:\n<code>{id}</code>\nTipo: {type}",

    admin_panel_title: "🛠 Panel de administración:",
    btn_broadcast: "📢 Difusión",
    btn_stats: "📊 Estadísticas",
    btn_locks: "🔒 Canales obligatorios",
    btn_wallet: "💳 Billetera",
    btn_wallet_edit: "✏️ Configurar / cambiar billetera",
    broadcast_ask: "Envía el mensaje que quieres difundir a todos los usuarios.",
    broadcast_confirm: "¿Enviar esto a todos los usuarios ahora?",
    broadcast_sending: "⏳ Enviando… esto puede tardar.",
    broadcast_done: "✅ Difusión terminada.\nEnviados: {sent}\nFallidos: {failed}",
    stats_title: "📊 Estadísticas del bot\n\n👥 Usuarios: {users}\n💬 Mensajes procesados: {messages}\n🔒 Bloqueos activos: {locks}\n💳 Billetera configurada: {wallet}",
    locks_title: "🔒 Canales/grupos obligatorios\nLos usuarios deben unirse a todos estos para usar el bot.",
    locks_add_btn: "➕ Añadir bloqueo",
    locks_remove_btn: "❌ Eliminar",
    locks_add_ask: "Reenvía un mensaje del canal/grupo o envía su @usuario / ID numérico.\n⚠️ El bot debe ser administrador ahí.",
    locks_added: "✅ Bloqueo añadido: {title}",
    locks_removed: "✅ Bloqueo eliminado.",
    locks_empty: "Aún no hay bloqueos configurados.",
    wallet_title: "💳 Billetera actual:\n\nRed/moneda: {network}\nDirección: <code>{address}</code>",
    wallet_not_set: "💳 Aún no se ha configurado una billetera.",
    wallet_ask_network: "Envía el nombre de la red/moneda (p. ej. TON, TRC20 USDT, BTC):",
    wallet_ask_address: "Ahora envía la dirección de depósito para «{network}»:",
    wallet_saved: "✅ Billetera guardada.",
    support_title: "💛 Apoya este bot",
    support_text: "Si te gusta este bot, puedes apoyar su desarrollo donando:\n\nRed/moneda: {network}\nDirección: <code>{address}</code>\n\n¡Gracias! 🙏",
    support_no_wallet: "El administrador aún no ha configurado una billetera de donación.",
    not_admin: "⛔️ No eres administrador.",
    join_required_title: "🔒 Para usar el bot primero debes unirte a lo siguiente:",
    join_check_btn: "✅ Ya me uní, revisar de nuevo",
    join_still_missing: "❗️ Todavía no te has unido a todos los canales/grupos requeridos.",
    btn_stats_code: "📊 Estadísticas",
    btn_edit_buttons: "✏️ Editar botones",
    btn_delete_code: "🗑 Eliminar",
    code_stats_title: "📊 Estadísticas del mensaje\n\nEnvíos directos: {sent}\nBotones: {buttons}\nCreado: {created}",
    code_deleted: "✅ Mensaje eliminado. El código ya no funciona.",
    code_not_owner: "⛔️ Este código de mensaje no te pertenece.",
    code_gone: "❗️ Este código ya no existe.",
    view_message_btn: "🔗 Ver mensaje",
    generic_error: "⚠️ Algo salió mal. Inténtalo de nuevo.",
  },
  zh: {
    choose_lang: "🌐 请选择您的语言：",
    lang_changed: "✅ 语言已更新。",
    main_menu_title: "✨ 主菜单 — 选择一个工具：",
    btn_create: "🧩 创建消息",
    btn_send: "📤 无引用发送",
    btn_mychats: "🗂 我的频道/群组",
    btn_idfinder: "🆔 查找数字ID",
    btn_support: "💛 支持本机器人",
    btn_admin: "🛠 管理面板",
    btn_back: "🔙 返回",
    btn_cancel: "✖️ 取消",
    btn_skip: "⏭ 跳过",
    btn_yes: "✅ 是",
    btn_no: "❌ 否",
    cancelled: "已取消。",
    create_ask_content: "请发送您想要的消息（文本、图片、视频、文件……），它将完全按原样发送，不会被修改。",
    create_ask_buttons: "要添加玻璃按钮吗？请按此格式发送（第一行按钮文字，第二行链接）：\n\n链接1\nhttps://link1.com\n链接2\nhttps://link2.com\n\n如果不需要按钮，请点击“跳过”。",
    create_invalid_buttons: "⚠️ 格式错误。每个按钮需要2行：文字，然后是以http(s)://开头的链接。请重试，或点击“跳过”。",
    btn_pick_color: "为此按钮选择颜色：\n«{text}»",
    color_primary: "🔵 主要",
    color_success: "🟢 成功",
    color_danger: "🔴 危险",
    color_default: "⚪️ 默认",
    create_more_buttons_q: "要添加另一个按钮吗？",
    create_done: "✅ 您的消息已准备好！\n\n🔑 消息代码：\n<code>{code}</code>\n\n请保存此代码 — 随时使用“无引用发送”将此消息原样发送到机器人管理的任何频道/群组。同一代码也可用于查看统计、编辑按钮或删除消息（见下方按钮）。",
    share_btn: "🔗 分享",
    send_now_btn: "📤 无引用发送",
    schedule_send_btn: "⏰ 定时发送",
    schedule_ask_hours: "请发送几小时后发送此消息（例如 2 或 0.5）：",
    schedule_invalid_hours: "⚠️ 请发送一个有效的正数小时（例如 1、2.5、24）。最大 720。",
    schedule_confirmed: "✅ 已安排！此消息将在 {hours} 小时后发送到「{target}」，大约在 {time}。",
    schedule_delivered: "✅ 您的定时消息已发送到「{target}」。",
    schedule_failed: "❗️ 发送定时消息到「{target}」失败（机器人可能已不是那里的管理员）。",
    send_ask_code: "请发送您要发送的消息代码：",
    send_code_not_found: "❗️ 未找到该代码。请检查后重新发送。",
    send_choose_target: "要发送到哪里？",
    send_enter_id_btn: "✏️ 输入新的ID/用户名",
    send_ask_target: "请发送机器人担任管理员的频道/群组的数字ID或@用户名：",
    send_not_admin_there: "❗️ 机器人在那里不是管理员。请先将机器人设为该频道/群组的管理员，然后重试。",
    send_success: "✅ 消息已成功发送。",
    send_save_target_q: "要保存此频道/群组以便下次使用吗？",
    mychats_title: "🗂 您保存的频道/群组：",
    mychats_empty: "尚未保存任何内容。",
    mychats_add_btn: "➕ 添加",
    mychats_remove_btn: "❌ 删除",
    mychats_add_ask: "请发送频道/群组的数字ID或@用户名（机器人必须是那里的管理员）：",
    mychats_added: "✅ 已保存：{title}",
    mychats_removed: "✅ 已删除。",
    mychats_not_admin: "❗️ 机器人尚未在那里担任管理员。",
    id_ask: "🆔 查找数字ID\n\n• 拥有@用户名的公开频道/群组/用户 → 直接发送@用户名。\n• 私密用户 → 转发其任意一条消息给我（如果对方未隐藏转发信息）。\n• 您自己 → 点击下方按钮，或随时发送/myid。\n• 没有用户名的私密群组/频道 → 将我添加为该群组/频道的管理员，然后在群组/频道内发送/id，我会回复其数字ID。\n• 或者直接转发该聊天中的任意一条消息给我。",
    id_myid_btn: "🙋 我的ID",
    id_user_result: "👤 用户\nID: <code>{id}</code>\n姓名: {name}\n用户名: {username}",
    id_chat_result: "📢 聊天\nID: <code>{id}</code>\n类型: {type}\n标题: {title}",
    id_not_found: "❗️ 未能找到该ID。请确认用户名正确且为公开，或转发一条转发信息可见的消息。",
    id_forward_hidden: "❗️ 该用户在转发时隐藏了账户信息，因此Telegram不会将其ID提供给机器人（这是用户自己的隐私设置）。",
    id_group_reply: "🆔 该聊天的ID：\n<code>{id}</code>\n类型: {type}",
    admin_panel_title: "🛠 管理面板：",
    btn_broadcast: "📢 群发",
    btn_stats: "📊 统计信息",
    btn_locks: "🔒 加入锁定频道",
    btn_wallet: "💳 钱包",
    btn_wallet_edit: "✏️ 设置/修改钱包",
    broadcast_ask: "请发送您想要群发给所有用户的消息（任意类型）。",
    broadcast_confirm: "现在将此消息发送给所有用户吗？",
    broadcast_sending: "⏳ 发送中……可能需要一些时间。",
    broadcast_done: "✅ 群发已完成。\n成功：{sent}\n失败：{failed}",
    stats_title: "📊 机器人统计\n\n👥 用户数：{users}\n💬 已处理消息数：{messages}\n🔒 活跃锁定数：{locks}\n💳 钱包已设置：{wallet}",
    locks_title: "🔒 加入锁定的频道/群组\n用户必须加入以下所有频道/群组才能使用机器人。",
    locks_add_btn: "➕ 添加锁定",
    locks_remove_btn: "❌ 删除",
    locks_add_ask: "请转发该频道/群组的一条消息，或发送其@用户名/数字ID。\n⚠️ 机器人必须是那里的管理员。",
    locks_added: "✅ 已添加锁定：{title}",
    locks_removed: "✅ 已删除锁定。",
    locks_empty: "尚未配置任何锁定。",
    wallet_title: "💳 当前钱包：\n\n网络/币种：{network}\n地址：<code>{address}</code>",
    wallet_not_set: "💳 尚未设置钱包。",
    wallet_ask_network: "请发送网络/币种名称（例如TON、TRC20 USDT、BTC）：",
    wallet_ask_address: "现在请发送«{network}»的收款地址：",
    wallet_saved: "✅ 钱包已保存。",
    support_title: "💛 支持本机器人",
    support_text: "如果您喜欢这个机器人，可以通过捐赠支持其开发：\n\n网络/币种：{network}\n地址：<code>{address}</code>\n\n谢谢！🙏",
    support_no_wallet: "管理员尚未设置捐赠钱包。",
    not_admin: "⛔️ 您不是管理员。",
    join_required_title: "🔒 使用本机器人前，您必须先加入以下内容：",
    join_check_btn: "✅ 我已加入，重新检查",
    join_still_missing: "❗️ 您尚未加入所有必需的频道/群组。",
    btn_stats_code: "📊 统计",
    btn_edit_buttons: "✏️ 编辑按钮",
    btn_delete_code: "🗑 删除",
    code_stats_title: "📊 消息统计\n\n直接发送次数：{sent}\n按钮数量：{buttons}\n创建时间：{created}",
    code_deleted: "✅ 消息已删除。此代码将不再可用。",
    code_not_owner: "⛔️ 此消息代码不属于您。",
    code_gone: "❗️ 此代码已不存在（可能已被删除）。",
    view_message_btn: "🔗 查看消息",
    generic_error: "⚠️ 出了点问题，请重试。",
  },
  hi: {
    choose_lang: "🌐 अपनी भाषा चुनें:",
    lang_changed: "✅ भाषा अपडेट हो गई।",
    main_menu_title: "✨ मुख्य मेनू — एक टूल चुनें:",
    btn_create: "🧩 संदेश बनाएं",
    btn_send: "📤 बिना कोट भेजें",
    btn_mychats: "🗂 मेरे चैनल/ग्रुप",
    btn_idfinder: "🆔 न्यूमेरिक आईडी खोजें",
    btn_support: "💛 बॉट को सपोर्ट करें",
    btn_admin: "🛠 एडमिन पैनल",
    btn_back: "🔙 वापस",
    btn_cancel: "✖️ रद्द करें",
    btn_skip: "⏭ छोड़ें",
    btn_yes: "✅ हाँ",
    btn_no: "❌ नहीं",
    cancelled: "रद्द किया गया।",
    create_ask_content: "मुझे वह संदेश भेजें जो आप चाहते हैं (टेक्स्ट, फोटो, वीडियो, फ़ाइल...) — यह बिल्कुल वैसे ही भेजा जाएगा, इसमें कोई बदलाव नहीं होगा।",
    create_ask_buttons: "क्या आप ग्लास बटन जोड़ना चाहते हैं? इस फॉर्मेट में भेजें (पहली लाइन बटन का टेक्स्ट, दूसरी लाइन लिंक):\n\nलिंक 1\nhttps://link1.com\nलिंक 2\nhttps://link2.com\n\nयदि बटन नहीं चाहिए तो «छोड़ें» दबाएं।",
    create_invalid_buttons: "⚠️ फॉर्मेट गलत है। हर बटन के लिए 2 लाइनें चाहिए: टेक्स्ट, फिर http(s):// से शुरू होने वाला लिंक। फिर से कोशिश करें या «छोड़ें» दबाएं।",
    btn_pick_color: "इस बटन के लिए एक रंग चुनें:\n«{text}»",
    color_primary: "🔵 प्राइमरी",
    color_success: "🟢 सफलता",
    color_danger: "🔴 खतरा",
    color_default: "⚪️ डिफ़ॉल्ट",
    create_more_buttons_q: "एक और बटन जोड़ें?",
    create_done: "✅ आपका संदेश तैयार है!\n\n🔑 संदेश कोड:\n<code>{code}</code>\n\nइस कोड को सुरक्षित रखें — «बिना कोट भेजें» का उपयोग करके इसे कभी भी बॉट द्वारा प्रबंधित किसी भी चैनल/ग्रुप में बिल्कुल वैसे ही भेजें। यही कोड इसके आँकड़े देखने, बटन एडिट करने या डिलीट करने के लिए भी इस्तेमाल होता है (नीचे बटन)।",
    share_btn: "🔗 शेयर करें",
    send_now_btn: "📤 बिना कोट भेजें",
    schedule_send_btn: "⏰ शेड्यूल भेजें",
    schedule_ask_hours: "यह संदेश कितने घंटे बाद भेजा जाए, संख्या भेजें (जैसे 2 या 0.5):",
    schedule_invalid_hours: "⚠️ कृपया एक मान्य सकारात्मक घंटों की संख्या भेजें (जैसे 1, 2.5, 24)। अधिकतम 720।",
    schedule_confirmed: "✅ शेड्यूल हो गया! यह संदेश «{target}» को {hours} घंटे में, लगभग {time} बजे भेजा जाएगा।",
    schedule_delivered: "✅ आपका शेड्यूल किया गया संदेश «{target}» को भेज दिया गया।",
    schedule_failed: "❗️ आपका शेड्यूल किया गया संदेश «{target}» को भेजने में विफल रहा (शायद बॉट अब वहां एडमिन नहीं है)।",
    send_ask_code: "जो संदेश कोड भेजना है वह भेजें:",
    send_code_not_found: "❗️ कोड नहीं मिला। कृपया जांचें और फिर से भेजें।",
    send_choose_target: "यह कहाँ भेजा जाए?",
    send_enter_id_btn: "✏️ नई आईडी/यूज़रनेम दर्ज करें",
    send_ask_target: "उस चैनल/ग्रुप की न्यूमेरिक आईडी या @यूज़रनेम भेजें जहाँ बॉट एडमिन है:",
    send_not_admin_there: "❗️ बॉट वहाँ एडमिन नहीं है। पहले बॉट को उस चैनल/ग्रुप में एडमिन बनाएं, फिर पुनः प्रयास करें।",
    send_success: "✅ संदेश सफलतापूर्वक भेजा गया।",
    send_save_target_q: "अगली बार के लिए इस चैनल/ग्रुप को सेव करें?",
    mychats_title: "🗂 आपके सेव किए गए चैनल/ग्रुप:",
    mychats_empty: "अभी तक कुछ भी सेव नहीं किया गया है।",
    mychats_add_btn: "➕ जोड़ें",
    mychats_remove_btn: "❌ हटाएं",
    mychats_add_ask: "चैनल/ग्रुप की न्यूमेरिक आईडी या @यूज़रनेम भेजें (बॉट को वहाँ एडमिन होना चाहिए):",
    mychats_added: "✅ सेव किया गया: {title}",
    mychats_removed: "✅ हटा दिया गया।",
    mychats_not_admin: "❗️ बॉट अभी तक वहाँ एडमिन नहीं है।",
    id_ask: "🆔 न्यूमेरिक आईडी खोजें\n\n• @यूज़रनेम वाला पब्लिक चैनल/ग्रुप/यूज़र → बस @यूज़रनेम भेजें।\n• प्राइवेट यूज़र → उनका कोई संदेश मुझे फॉरवर्ड करें (यदि उन्होंने फॉरवर्ड जानकारी छुपाई नहीं है)।\n• खुद के लिए → नीचे दिया बटन दबाएं, या कभी भी /myid भेजें।\n• बिना यूज़रनेम वाला प्राइवेट ग्रुप/चैनल → मुझे वहाँ एडमिन बनाएं, फिर उस ग्रुप/चैनल में /id भेजें और मैं उसकी न्यूमेरिक आईडी बताऊंगा।\n• या बस उस चैट का कोई संदेश मुझे फॉरवर्ड करें।",
    id_myid_btn: "🙋 मेरी आईडी",
    id_user_result: "👤 यूज़र\nआईडी: <code>{id}</code>\nनाम: {name}\nयूज़रनेम: {username}",
    id_chat_result: "📢 चैट\nआईडी: <code>{id}</code>\nप्रकार: {type}\nशीर्षक: {title}",
    id_not_found: "❗️ वह आईडी नहीं मिली। सुनिश्चित करें कि यूज़रनेम सही और पब्लिक है, या फॉरवर्ड जानकारी दिखाई देने वाला संदेश फॉरवर्ड करें।",
    id_forward_hidden: "❗️ इस यूज़र ने फॉरवर्ड करते समय अपना अकाउंट छुपाया है, इसलिए टेलीग्राम बॉट्स को उनकी आईडी नहीं देता (यह उनकी अपनी प्राइवेसी सेटिंग है)।",
    id_group_reply: "🆔 इस चैट की आईडी:\n<code>{id}</code>\nप्रकार: {type}",
    admin_panel_title: "🛠 एडमिन पैनल:",
    btn_broadcast: "📢 ब्रॉडकास्ट",
    btn_stats: "📊 आँकड़े",
    btn_locks: "🔒 जॉइन-लॉक चैनल",
    btn_wallet: "💳 वॉलेट",
    btn_wallet_edit: "✏️ वॉलेट सेट/बदलें",
    broadcast_ask: "वह संदेश भेजें जो आप सभी यूज़र्स को ब्रॉडकास्ट करना चाहते हैं (किसी भी प्रकार का)।",
    broadcast_confirm: "क्या इसे अभी सभी यूज़र्स को भेजें?",
    broadcast_sending: "⏳ भेजा जा रहा है… इसमें कुछ समय लग सकता है।",
    broadcast_done: "✅ ब्रॉडकास्ट पूरा हुआ।\nसफल: {sent}\nविफल: {failed}",
    stats_title: "📊 बॉट के आँकड़े\n\n👥 यूज़र्स: {users}\n💬 प्रोसेस किए गए संदेश: {messages}\n🔒 सक्रिय लॉक: {locks}\n💳 वॉलेट सेट: {wallet}",
    locks_title: "🔒 जॉइन-लॉक चैनल/ग्रुप\nबॉट इस्तेमाल करने के लिए यूज़र्स को इन सभी में जॉइन होना होगा।",
    locks_add_btn: "➕ लॉक जोड़ें",
    locks_remove_btn: "❌ हटाएं",
    locks_add_ask: "चैनल/ग्रुप का कोई संदेश फॉरवर्ड करें, या इसका @यूज़रनेम/न्यूमेरिक आईडी भेजें।\n⚠️ बॉट को वहाँ एडमिन होना चाहिए।",
    locks_added: "✅ लॉक जोड़ा गया: {title}",
    locks_removed: "✅ लॉक हटाया गया।",
    locks_empty: "अभी तक कोई लॉक कॉन्फ़िगर नहीं किया गया।",
    wallet_title: "💳 वर्तमान वॉलेट:\n\nनेटवर्क/कॉइन: {network}\nएड्रेस: <code>{address}</code>",
    wallet_not_set: "💳 अभी तक कोई वॉलेट सेट नहीं है।",
    wallet_ask_network: "नेटवर्क/कॉइन का नाम भेजें (जैसे TON, TRC20 USDT, BTC):",
    wallet_ask_address: "अब «{network}» के लिए डिपॉज़िट एड्रेस भेजें:",
    wallet_saved: "✅ वॉलेट सेव हो गया।",
    support_title: "💛 इस बॉट को सपोर्ट करें",
    support_text: "अगर आपको यह बॉट पसंद है, तो आप डोनेशन देकर इसके डेवलपमेंट को सपोर्ट कर सकते हैं:\n\nनेटवर्क/कॉइन: {network}\nएड्रेस: <code>{address}</code>\n\nधन्यवाद! 🙏",
    support_no_wallet: "एडमिन ने अभी तक डोनेशन वॉलेट सेट नहीं किया है।",
    not_admin: "⛔️ आप एडमिन नहीं हैं।",
    join_required_title: "🔒 बॉट इस्तेमाल करने के लिए पहले आपको इनमें जॉइन होना होगा:",
    join_check_btn: "✅ मैंने जॉइन कर लिया, फिर से जांचें",
    join_still_missing: "❗️ आपने अभी भी सभी आवश्यक चैनल/ग्रुप जॉइन नहीं किए हैं।",
    btn_stats_code: "📊 आँकड़े",
    btn_edit_buttons: "✏️ बटन एडिट करें",
    btn_delete_code: "🗑 हटाएं",
    code_stats_title: "📊 संदेश के आँकड़े\n\nडायरेक्ट भेजे गए: {sent}\nबटन: {buttons}\nबनाया गया: {created}",
    code_deleted: "✅ संदेश डिलीट हो गया। यह कोड अब काम नहीं करेगा।",
    code_not_owner: "⛔️ यह संदेश कोड आपका नहीं है।",
    code_gone: "❗️ यह कोड अब मौजूद नहीं है (शायद डिलीट हो गया है)।",
    view_message_btn: "🔗 संदेश देखें",
    generic_error: "⚠️ कुछ गलत हो गया। कृपया फिर से कोशिश करें।",
  },
  fr: {
    choose_lang: "🌐 Choisissez votre langue :",
    lang_changed: "✅ Langue mise à jour.",
    main_menu_title: "✨ Menu principal — choisissez un outil :",
    btn_create: "🧩 Créer un message",
    btn_send: "📤 Envoyer sans citation",
    btn_mychats: "🗂 Mes canaux/groupes",
    btn_idfinder: "🆔 Trouver l'ID numérique",
    btn_support: "💛 Soutenir le bot",
    btn_admin: "🛠 Panneau admin",
    btn_back: "🔙 Retour",
    btn_cancel: "✖️ Annuler",
    btn_skip: "⏭ Passer",
    btn_yes: "✅ Oui",
    btn_no: "❌ Non",
    cancelled: "Annulé.",
    create_ask_content: "Envoyez-moi le message que vous voulez (texte, photo, vidéo, fichier…) exactement tel quel — il ne sera jamais modifié.",
    create_ask_buttons: "Voulez-vous ajouter des boutons ? Envoyez-les ainsi (texte du bouton sur une ligne, lien sur la suivante) :\n\nLien 1\nhttps://link1.com\nLien 2\nhttps://link2.com\n\nOu appuyez sur « Passer » si vous n'en voulez pas.",
    create_invalid_buttons: "⚠️ Format incorrect. Chaque bouton a besoin de 2 lignes : texte, puis un lien commençant par http(s)://. Réessayez, ou passez.",
    btn_pick_color: "Choisissez une couleur pour ce bouton :\n«{text}»",
    color_primary: "🔵 Primaire",
    color_success: "🟢 Succès",
    color_danger: "🔴 Danger",
    color_default: "⚪️ Par défaut",
    create_more_buttons_q: "Ajouter un autre bouton ?",
    create_done: "✅ Votre message est prêt !\n\n🔑 Code du message :\n<code>{code}</code>\n\nConservez ce code — utilisez « Envoyer sans citation » à tout moment pour livrer ce message exact à tout canal/groupe administré par le bot. Le même code permet aussi de voir les statistiques, modifier les boutons ou supprimer le message (boutons ci-dessous).",
    share_btn: "🔗 Partager",
    send_now_btn: "📤 Envoyer sans citation",
    schedule_send_btn: "⏰ Envoi programmé",
    schedule_ask_hours: "Envoyez le nombre d'heures à partir de maintenant pour l'envoi de ce message (ex. 2 ou 0.5) :",
    schedule_invalid_hours: "⚠️ Veuillez envoyer un nombre d'heures valide et positif (ex. 1, 2.5, 24). Maximum 720.",
    schedule_confirmed: "✅ Programmé ! Ce message sera envoyé à «{target}» dans {hours}h, vers {time}.",
    schedule_delivered: "✅ Votre message programmé a été livré à «{target}».",
    schedule_failed: "❗️ Échec de la livraison de votre message programmé à «{target}» (le bot n'est peut-être plus admin là-bas).",
    send_ask_code: "Envoyez le code du message à livrer :",
    send_code_not_found: "❗️ Code introuvable. Vérifiez et renvoyez-le.",
    send_choose_target: "Où faut-il envoyer ceci ?",
    send_enter_id_btn: "✏️ Saisir un nouvel ID/nom d'utilisateur",
    send_ask_target: "Envoyez l'ID numérique ou @nomutilisateur du canal/groupe où le bot est admin :",
    send_not_admin_there: "❗️ Le bot n'est pas admin là-bas. Ajoutez-le d'abord comme admin, puis réessayez.",
    send_success: "✅ Message livré avec succès.",
    send_save_target_q: "Enregistrer ce canal/groupe pour la prochaine fois ?",
    mychats_title: "🗂 Vos canaux/groupes enregistrés :",
    mychats_empty: "Rien d'enregistré pour l'instant.",
    mychats_add_btn: "➕ Ajouter",
    mychats_remove_btn: "❌ Supprimer",
    mychats_add_ask: "Envoyez l'ID numérique ou @nomutilisateur du canal/groupe (le bot doit y être admin) :",
    mychats_added: "✅ Enregistré : {title}",
    mychats_removed: "✅ Supprimé.",
    mychats_not_admin: "❗️ Le bot n'est pas encore admin là-bas.",
    id_ask: "🆔 Trouver un ID numérique\n\n• Canal/groupe/utilisateur public avec @nomutilisateur → envoyez simplement @nomutilisateur.\n• Utilisateur privé → transférez-moi un de ses messages (si les infos de transfert ne sont pas masquées).\n• Vous-même → appuyez sur le bouton ci-dessous, ou envoyez /myid.\n• Groupe/canal privé sans nom d'utilisateur → ajoutez-moi comme admin, puis envoyez /id dans ce groupe/canal.\n• Ou transférez-moi simplement un message de ce chat.",
    id_myid_btn: "🙋 Mon propre ID",
    id_user_result: "👤 Utilisateur\nID : <code>{id}</code>\nNom : {name}\nNom d'utilisateur : {username}",
    id_chat_result: "📢 Chat\nID : <code>{id}</code>\nType : {type}\nTitre : {title}",
    id_not_found: "❗️ ID introuvable. Vérifiez que le nom d'utilisateur est correct et public, ou transférez un message avec les infos de transfert visibles.",
    id_forward_hidden: "❗️ Cet utilisateur a masqué son compte lors du transfert, Telegram ne donne donc pas son ID aux bots (c'est son propre réglage de confidentialité).",
    id_group_reply: "🆔 ID de ce chat :\n<code>{id}</code>\nType : {type}",
    admin_panel_title: "🛠 Panneau admin :",
    btn_broadcast: "📢 Diffusion",
    btn_stats: "📊 Statistiques",
    btn_locks: "🔒 Canaux à rejoindre obligatoirement",
    btn_wallet: "💳 Portefeuille",
    btn_wallet_edit: "✏️ Définir/modifier le portefeuille",
    broadcast_ask: "Envoyez le message que vous voulez diffuser à tous les utilisateurs (tout type).",
    broadcast_confirm: "Envoyer ceci à tous les utilisateurs maintenant ?",
    broadcast_sending: "⏳ Envoi en cours… cela peut prendre du temps.",
    broadcast_done: "✅ Diffusion terminée.\nEnvoyés : {sent}\nÉchoués : {failed}",
    stats_title: "📊 Statistiques du bot\n\n👥 Utilisateurs : {users}\n💬 Messages traités : {messages}\n🔒 Verrous actifs : {locks}\n💳 Portefeuille défini : {wallet}",
    locks_title: "🔒 Canaux/groupes à rejoindre obligatoirement\nLes utilisateurs doivent tous les rejoindre avant d'utiliser le bot.",
    locks_add_btn: "➕ Ajouter un verrou",
    locks_remove_btn: "❌ Supprimer",
    locks_add_ask: "Transférez un message du canal/groupe, ou envoyez son @nomutilisateur / ID numérique.\n⚠️ Le bot doit y être admin.",
    locks_added: "✅ Verrou ajouté : {title}",
    locks_removed: "✅ Verrou supprimé.",
    locks_empty: "Aucun verrou configuré pour l'instant.",
    wallet_title: "💳 Portefeuille actuel :\n\nRéseau/monnaie : {network}\nAdresse : <code>{address}</code>",
    wallet_not_set: "💳 Aucun portefeuille défini pour l'instant.",
    wallet_ask_network: "Envoyez le nom du réseau/de la monnaie (ex : TON, TRC20 USDT, BTC) :",
    wallet_ask_address: "Envoyez maintenant l'adresse de dépôt pour « {network} » :",
    wallet_saved: "✅ Portefeuille enregistré.",
    support_title: "💛 Soutenir ce bot",
    support_text: "Si vous aimez ce bot, vous pouvez soutenir son développement avec un don :\n\nRéseau/monnaie : {network}\nAdresse : <code>{address}</code>\n\nMerci ! 🙏",
    support_no_wallet: "L'admin n'a pas encore défini de portefeuille de don.",
    not_admin: "⛔️ Vous n'êtes pas admin.",
    join_required_title: "🔒 Pour utiliser ce bot, vous devez d'abord rejoindre les éléments suivants :",
    join_check_btn: "✅ J'ai rejoint, revérifier",
    join_still_missing: "❗️ Vous n'avez pas encore rejoint tous les canaux/groupes requis.",
    btn_stats_code: "📊 Statistiques",
    btn_edit_buttons: "✏️ Modifier les boutons",
    btn_delete_code: "🗑 Supprimer",
    code_stats_title: "📊 Statistiques du message\n\nEnvois directs : {sent}\nBoutons : {buttons}\nCréé : {created}",
    code_deleted: "✅ Message supprimé. Ce code ne fonctionne plus.",
    code_not_owner: "⛔️ Ce code de message ne vous appartient pas.",
    code_gone: "❗️ Ce code n'existe plus (peut-être supprimé).",
    view_message_btn: "🔗 Voir le message",
    generic_error: "⚠️ Une erreur s'est produite. Veuillez réessayer.",
  },
  de: {
    choose_lang: "🌐 Wähle deine Sprache:",
    lang_changed: "✅ Sprache aktualisiert.",
    main_menu_title: "✨ Hauptmenü — wähle ein Werkzeug:",
    btn_create: "🧩 Nachricht erstellen",
    btn_send: "📤 Ohne Zitat senden",
    btn_mychats: "🗂 Meine Kanäle/Gruppen",
    btn_idfinder: "🆔 Numerische ID finden",
    btn_support: "💛 Bot unterstützen",
    btn_admin: "🛠 Admin-Panel",
    btn_back: "🔙 Zurück",
    btn_cancel: "✖️ Abbrechen",
    btn_skip: "⏭ Überspringen",
    btn_yes: "✅ Ja",
    btn_no: "❌ Nein",
    cancelled: "Abgebrochen.",
    create_ask_content: "Sende mir die gewünschte Nachricht (Text, Foto, Video, Datei …) genau so, wie sie zugestellt werden soll — sie wird niemals verändert.",
    create_ask_buttons: "Möchtest du Glass-Buttons hinzufügen? Sende sie so (Buttontext in einer Zeile, Link in der nächsten):\n\nLink 1\nhttps://link1.com\nLink 2\nhttps://link2.com\n\nOder tippe auf „Überspringen“, wenn du keine Buttons brauchst.",
    create_invalid_buttons: "⚠️ Falsches Format. Jeder Button braucht 2 Zeilen: Text, dann ein Link mit http(s)://. Versuche es erneut, oder überspringe.",
    btn_pick_color: "Wähle eine Farbe für diesen Button:\n«{text}»",
    color_primary: "🔵 Primär",
    color_success: "🟢 Erfolg",
    color_danger: "🔴 Gefahr",
    color_default: "⚪️ Standard",
    create_more_buttons_q: "Weiteren Button hinzufügen?",
    create_done: "✅ Deine Nachricht ist fertig!\n\n🔑 Nachrichtencode:\n<code>{code}</code>\n\nBewahre diesen Code auf — nutze jederzeit „Ohne Zitat senden“, um diese exakte Nachricht an jeden vom Bot verwalteten Kanal/Gruppe zu liefern. Mit demselben Code kannst du auch die Statistik einsehen, die Buttons bearbeiten oder die Nachricht löschen (Buttons unten).",
    share_btn: "🔗 Teilen",
    send_now_btn: "📤 Ohne Zitat senden",
    schedule_send_btn: "⏰ Geplanter Versand",
    schedule_ask_hours: "Sende die Anzahl der Stunden ab jetzt, nach denen diese Nachricht gesendet werden soll (z. B. 2 oder 0.5):",
    schedule_invalid_hours: "⚠️ Bitte sende eine gültige positive Stundenzahl (z. B. 1, 2.5, 24). Maximal 720.",
    schedule_confirmed: "✅ Geplant! Diese Nachricht wird in {hours}Std an «{target}» gesendet, etwa um {time}.",
    schedule_delivered: "✅ Deine geplante Nachricht wurde an «{target}» zugestellt.",
    schedule_failed: "❗️ Zustellung der geplanten Nachricht an «{target}» fehlgeschlagen (der Bot ist dort vielleicht kein Admin mehr).",
    send_ask_code: "Sende den Nachrichtencode, den du zustellen möchtest:",
    send_code_not_found: "❗️ Code nicht gefunden. Bitte prüfen und erneut senden.",
    send_choose_target: "Wohin soll das gesendet werden?",
    send_enter_id_btn: "✏️ Neue ID/Benutzername eingeben",
    send_ask_target: "Sende die numerische ID oder den @Benutzernamen des Kanals/der Gruppe, in dem der Bot Admin ist:",
    send_not_admin_there: "❗️ Der Bot ist dort kein Admin. Mache den Bot dort zuerst zum Admin und versuche es erneut.",
    send_success: "✅ Nachricht erfolgreich zugestellt.",
    send_save_target_q: "Diesen Kanal/diese Gruppe für nächstes Mal speichern?",
    mychats_title: "🗂 Deine gespeicherten Kanäle/Gruppen:",
    mychats_empty: "Noch nichts gespeichert.",
    mychats_add_btn: "➕ Hinzufügen",
    mychats_remove_btn: "❌ Entfernen",
    mychats_add_ask: "Sende die numerische ID oder den @Benutzernamen des Kanals/der Gruppe (der Bot muss dort Admin sein):",
    mychats_added: "✅ Gespeichert: {title}",
    mychats_removed: "✅ Entfernt.",
    mychats_not_admin: "❗️ Der Bot ist dort noch kein Admin.",
    id_ask: "🆔 Numerische ID finden\n\n• Öffentlicher Kanal/Gruppe/Nutzer mit @Benutzername → einfach @Benutzername senden.\n• Privater Nutzer → leite mir eine seiner Nachrichten weiter (falls die Weiterleitungsinfo nicht versteckt ist).\n• Du selbst → tippe unten auf den Button oder sende jederzeit /myid.\n• Private Gruppe/Kanal ohne Benutzername → füge mich dort als Admin hinzu und sende dann /id in dieser Gruppe/diesem Kanal.\n• Oder leite mir einfach eine Nachricht aus diesem Chat weiter.",
    id_myid_btn: "🙋 Meine eigene ID",
    id_user_result: "👤 Nutzer\nID: <code>{id}</code>\nName: {name}\nBenutzername: {username}",
    id_chat_result: "📢 Chat\nID: <code>{id}</code>\nTyp: {type}\nTitel: {title}",
    id_not_found: "❗️ ID konnte nicht gefunden werden. Stelle sicher, dass der Benutzername korrekt und öffentlich ist, oder leite eine Nachricht mit sichtbaren Weiterleitungsinfos weiter.",
    id_forward_hidden: "❗️ Dieser Nutzer hat sein Konto beim Weiterleiten versteckt, daher gibt Telegram Bots seine ID nicht (eigene Datenschutzeinstellung des Nutzers).",
    id_group_reply: "🆔 ID dieses Chats:\n<code>{id}</code>\nTyp: {type}",
    admin_panel_title: "🛠 Admin-Panel:",
    btn_broadcast: "📢 Broadcast",
    btn_stats: "📊 Statistiken",
    btn_locks: "🔒 Beitritts-gesperrte Kanäle",
    btn_wallet: "💳 Wallet",
    btn_wallet_edit: "✏️ Wallet festlegen/ändern",
    broadcast_ask: "Sende die Nachricht, die du an alle Nutzer senden möchtest (beliebiger Typ).",
    broadcast_confirm: "Dies jetzt an alle Nutzer senden?",
    broadcast_sending: "⏳ Wird gesendet… das kann eine Weile dauern.",
    broadcast_done: "✅ Broadcast abgeschlossen.\nGesendet: {sent}\nFehlgeschlagen: {failed}",
    stats_title: "📊 Bot-Statistiken\n\n👥 Nutzer: {users}\n💬 Verarbeitete Nachrichten: {messages}\n🔒 Aktive Sperren: {locks}\n💳 Wallet festgelegt: {wallet}",
    locks_title: "🔒 Beitritts-gesperrte Kanäle/Gruppen\nNutzer müssen allen davon beitreten, bevor sie den Bot nutzen können.",
    locks_add_btn: "➕ Sperre hinzufügen",
    locks_remove_btn: "❌ Entfernen",
    locks_add_ask: "Leite eine Nachricht aus dem Kanal/der Gruppe weiter oder sende dessen @Benutzername/numerische ID.\n⚠️ Der Bot muss dort Admin sein.",
    locks_added: "✅ Sperre hinzugefügt: {title}",
    locks_removed: "✅ Sperre entfernt.",
    locks_empty: "Noch keine Sperren konfiguriert.",
    wallet_title: "💳 Aktuelles Wallet:\n\nNetzwerk/Coin: {network}\nAdresse: <code>{address}</code>",
    wallet_not_set: "💳 Es wurde noch kein Wallet festgelegt.",
    wallet_ask_network: "Sende den Netzwerk-/Coin-Namen (z. B. TON, TRC20 USDT, BTC):",
    wallet_ask_address: "Sende jetzt die Einzahlungsadresse für „{network}“:",
    wallet_saved: "✅ Wallet gespeichert.",
    support_title: "💛 Diesen Bot unterstützen",
    support_text: "Wenn dir dieser Bot gefällt, kannst du die Entwicklung mit einer Spende unterstützen:\n\nNetzwerk/Coin: {network}\nAdresse: <code>{address}</code>\n\nDanke! 🙏",
    support_no_wallet: "Der Admin hat noch kein Spenden-Wallet festgelegt.",
    not_admin: "⛔️ Du bist kein Admin.",
    join_required_title: "🔒 Um diesen Bot zu nutzen, musst du zuerst Folgendem beitreten:",
    join_check_btn: "✅ Beigetreten, erneut prüfen",
    join_still_missing: "❗️ Du bist noch nicht allen erforderlichen Kanälen/Gruppen beigetreten.",
    btn_stats_code: "📊 Statistik",
    btn_edit_buttons: "✏️ Buttons bearbeiten",
    btn_delete_code: "🗑 Löschen",
    code_stats_title: "📊 Nachrichtenstatistik\n\nDirekte Sendungen: {sent}\nButtons: {buttons}\nErstellt: {created}",
    code_deleted: "✅ Nachricht gelöscht. Der Code funktioniert nicht mehr.",
    code_not_owner: "⛔️ Dieser Nachrichtencode gehört dir nicht.",
    code_gone: "❗️ Dieser Code existiert nicht mehr (vielleicht wurde er gelöscht).",
    view_message_btn: "🔗 Nachricht ansehen",
    generic_error: "⚠️ Etwas ist schiefgelaufen. Bitte versuche es erneut.",
  },
  ja: {
    choose_lang: "🌐 言語を選択してください：",
    lang_changed: "✅ 言語を更新しました。",
    main_menu_title: "✨ メインメニュー — ツールを選んでください：",
    btn_create: "🧩 メッセージを作成",
    btn_send: "📤 引用なしで送信",
    btn_mychats: "🗂 マイチャンネル/グループ",
    btn_idfinder: "🆔 数値IDを検索",
    btn_support: "💛 ボットを応援する",
    btn_admin: "🛠 管理パネル",
    btn_back: "🔙 戻る",
    btn_cancel: "✖️ キャンセル",
    btn_skip: "⏭ スキップ",
    btn_yes: "✅ はい",
    btn_no: "❌ いいえ",
    cancelled: "キャンセルしました。",
    create_ask_content: "送りたいメッセージ（テキスト、写真、動画、ファイルなど）をそのまま送ってください — 内容は一切変更されません。",
    create_ask_buttons: "ガラスボタンを追加しますか？次の形式で送ってください（1行目にボタンのテキスト、2行目にリンク）：\n\nリンク1\nhttps://link1.com\nリンク2\nhttps://link2.com\n\nボタンが不要な場合は「スキップ」を押してください。",
    create_invalid_buttons: "⚠️ 形式が正しくありません。各ボタンには2行が必要です：テキスト、その後にhttp(s)://で始まるリンク。もう一度試すか、スキップしてください。",
    btn_pick_color: "このボタンの色を選んでください：\n«{text}»",
    color_primary: "🔵 プライマリ",
    color_success: "🟢 成功",
    color_danger: "🔴 危険",
    color_default: "⚪️ デフォルト",
    create_more_buttons_q: "別のボタンを追加しますか？",
    create_done: "✅ メッセージの準備ができました！\n\n🔑 メッセージコード：\n<code>{code}</code>\n\nこのコードを保管してください — いつでも「引用なしで送信」を使って、このメッセージをボットが管理するどのチャンネル/グループにもそのまま届けられます。同じコードで統計の確認、ボタンの編集、削除も行えます（下のボタン）。",
    share_btn: "🔗 共有",
    send_now_btn: "📤 引用なしで送信",
    schedule_send_btn: "⏰ 予約送信",
    schedule_ask_hours: "何時間後にこのメッセージを送信するか、数字で送ってください（例：2 または 0.5）：",
    schedule_invalid_hours: "⚠️ 有効な正の時間数を送ってください（例：1、2.5、24）。最大720。",
    schedule_confirmed: "✅ 予約しました！このメッセージは {hours} 時間後、約 {time} に「{target}」へ送信されます。",
    schedule_delivered: "✅ 予約したメッセージが「{target}」に送信されました。",
    schedule_failed: "❗️ 予約したメッセージの「{target}」への送信に失敗しました（ボットがそこの管理者でなくなった可能性があります）。",
    send_ask_code: "届けたいメッセージコードを送ってください：",
    send_code_not_found: "❗️ コードが見つかりません。確認してもう一度送ってください。",
    send_choose_target: "どこに送りますか？",
    send_enter_id_btn: "✏️ 新しいID/ユーザー名を入力",
    send_ask_target: "ボットが管理者になっているチャンネル/グループの数値IDまたは@ユーザー名を送ってください：",
    send_not_admin_there: "❗️ そこではボットが管理者ではありません。先にそのチャンネル/グループでボットを管理者にしてから、もう一度お試しください。",
    send_success: "✅ メッセージを正常に送信しました。",
    send_save_target_q: "次回のためにこのチャンネル/グループを保存しますか？",
    mychats_title: "🗂 保存済みのチャンネル/グループ：",
    mychats_empty: "まだ何も保存されていません。",
    mychats_add_btn: "➕ 追加",
    mychats_remove_btn: "❌ 削除",
    mychats_add_ask: "チャンネル/グループの数値IDまたは@ユーザー名を送ってください（ボットがそこで管理者である必要があります）：",
    mychats_added: "✅ 保存しました：{title}",
    mychats_removed: "✅ 削除しました。",
    mychats_not_admin: "❗️ ボットはまだそこで管理者ではありません。",
    id_ask: "🆔 数値IDを検索\n\n• @ユーザー名を持つ公開チャンネル/グループ/ユーザー → @ユーザー名を送るだけでOK。\n• 非公開ユーザー → その人のメッセージを転送してください（転送情報が隠されていない場合）。\n• 自分自身 → 下のボタンを押すか、いつでも/myidを送ってください。\n• ユーザー名のない非公開グループ/チャンネル → ボットをそこの管理者に追加し、そのグループ/チャンネル内で/idを送ってください。数値IDを返信します。\n• またはそのチャットのメッセージを転送するだけでもOKです。",
    id_myid_btn: "🙋 自分のID",
    id_user_result: "👤 ユーザー\nID: <code>{id}</code>\n名前: {name}\nユーザー名: {username}",
    id_chat_result: "📢 チャット\nID: <code>{id}</code>\nタイプ: {type}\nタイトル: {title}",
    id_not_found: "❗️ IDが見つかりませんでした。ユーザー名が正しく公開されているか確認するか、転送情報が表示されるメッセージを転送してください。",
    id_forward_hidden: "❗️ このユーザーは転送時にアカウントを非表示にしているため、Telegramはボットにその人のIDを渡しません（本人のプライバシー設定です）。",
    id_group_reply: "🆔 このチャットのID：\n<code>{id}</code>\nタイプ: {type}",
    admin_panel_title: "🛠 管理パネル：",
    btn_broadcast: "📢 一斉送信",
    btn_stats: "📊 統計",
    btn_locks: "🔒 参加必須チャンネル",
    btn_wallet: "💳 ウォレット",
    btn_wallet_edit: "✏️ ウォレットの設定/変更",
    broadcast_ask: "すべてのユーザーに一斉送信したいメッセージ（種類は問いません）を送ってください。",
    broadcast_confirm: "今すぐこれを全ユーザーに送信しますか？",
    broadcast_sending: "⏳ 送信中…しばらく時間がかかる場合があります。",
    broadcast_done: "✅ 一斉送信が完了しました。\n成功：{sent}\n失敗：{failed}",
    stats_title: "📊 ボット統計\n\n👥 ユーザー数：{users}\n💬 処理済みメッセージ数：{messages}\n🔒 有効なロック数：{locks}\n💳 ウォレット設定：{wallet}",
    locks_title: "🔒 参加必須チャンネル/グループ\nボットを使うにはこれらすべてに参加する必要があります。",
    locks_add_btn: "➕ ロックを追加",
    locks_remove_btn: "❌ 削除",
    locks_add_ask: "そのチャンネル/グループのメッセージを転送するか、@ユーザー名/数値IDを送ってください。\n⚠️ ボットがそこで管理者である必要があります。",
    locks_added: "✅ ロックを追加しました：{title}",
    locks_removed: "✅ ロックを削除しました。",
    locks_empty: "まだロックが設定されていません。",
    wallet_title: "💳 現在のウォレット：\n\nネットワーク/コイン：{network}\nアドレス：<code>{address}</code>",
    wallet_not_set: "💳 まだウォレットが設定されていません。",
    wallet_ask_network: "ネットワーク/コイン名を送ってください（例：TON、TRC20 USDT、BTC）：",
    wallet_ask_address: "次に「{network}」の入金アドレスを送ってください：",
    wallet_saved: "✅ ウォレットを保存しました。",
    support_title: "💛 このボットを応援する",
    support_text: "このボットが気に入ったら、寄付で開発を支援できます：\n\nネットワーク/コイン：{network}\nアドレス：<code>{address}</code>\n\nありがとうございます！🙏",
    support_no_wallet: "管理者はまだ寄付用ウォレットを設定していません。",
    not_admin: "⛔️ あなたは管理者ではありません。",
    join_required_title: "🔒 このボットを使うには、まず以下に参加する必要があります：",
    join_check_btn: "✅ 参加しました、再確認",
    join_still_missing: "❗️ まだ必要なチャンネル/グループすべてに参加していません。",
    btn_stats_code: "📊 統計",
    btn_edit_buttons: "✏️ ボタンを編集",
    btn_delete_code: "🗑 削除",
    code_stats_title: "📊 メッセージ統計\n\n直接送信数：{sent}\nボタン数：{buttons}\n作成日：{created}",
    code_deleted: "✅ メッセージを削除しました。このコードはもう使えません。",
    code_not_owner: "⛔️ このメッセージコードはあなたのものではありません。",
    code_gone: "❗️ このコードはもう存在しません（削除された可能性があります）。",
    view_message_btn: "🔗 メッセージを見る",
    generic_error: "⚠️ 問題が発生しました。もう一度お試しください。",
  },
  tr: {
    choose_lang: "🌐 Dilinizi seçin:",
    lang_changed: "✅ Dil güncellendi.",
    main_menu_title: "✨ Ana menü — bir araç seçin:",
    btn_create: "🧩 Mesaj oluştur",
    btn_send: "📤 Alıntısız gönder",
    btn_mychats: "🗂 Kanallarım/Gruplarım",
    btn_idfinder: "🆔 Sayısal ID bul",
    btn_support: "💛 Botu destekle",
    btn_admin: "🛠 Yönetim paneli",
    btn_back: "🔙 Geri",
    btn_cancel: "✖️ İptal",
    btn_skip: "⏭ Atla",
    btn_yes: "✅ Evet",
    btn_no: "❌ Hayır",
    cancelled: "İptal edildi.",
    create_ask_content: "İstediğiniz mesajı (metin, fotoğraf, video, dosya…) tam olarak nasıl iletilmesini istiyorsanız öyle gönderin — asla değiştirilmeyecek.",
    create_ask_buttons: "Cam buton eklemek ister misiniz? Şu formatta gönderin (bir satırda buton metni, sonraki satırda link):\n\nLink 1\nhttps://link1.com\nLink 2\nhttps://link2.com\n\nButon istemiyorsanız «Atla»ya dokunun.",
    create_invalid_buttons: "⚠️ Yanlış format. Her buton 2 satır gerektirir: metin, sonra http(s):// ile başlayan bir link. Tekrar deneyin veya atlayın.",
    btn_pick_color: "Bu buton için bir renk seçin:\n«{text}»",
    color_primary: "🔵 Birincil",
    color_success: "🟢 Başarı",
    color_danger: "🔴 Tehlike",
    color_default: "⚪️ Varsayılan",
    create_more_buttons_q: "Başka bir buton eklensin mi?",
    create_done: "✅ Mesajınız hazır!\n\n🔑 Mesaj kodu:\n<code>{code}</code>\n\nBu kodu saklayın — botun yönetici olduğu herhangi bir kanala/gruba bu mesajı aynen iletmek için istediğiniz zaman «Alıntısız gönder»i kullanın. Aynı kod istatistiklerini görmek, butonlarını düzenlemek veya silmek için de kullanılır (aşağıdaki butonlar).",
    share_btn: "🔗 Paylaş",
    send_now_btn: "📤 Alıntısız gönder",
    schedule_send_btn: "⏰ Zamanlanmış gönder",
    schedule_ask_hours: "Bu mesajın kaç saat sonra gönderileceğini bir sayı olarak gönderin (örn. 2 veya 0.5):",
    schedule_invalid_hours: "⚠️ Lütfen geçerli, pozitif bir saat sayısı gönderin (örn. 1, 2.5, 24). Maksimum 720.",
    schedule_confirmed: "✅ Zamanlandı! Bu mesaj {hours} saat içinde, yaklaşık {time} civarında «{target}» adresine gönderilecek.",
    schedule_delivered: "✅ Zamanlanmış mesajınız «{target}» adresine gönderildi.",
    schedule_failed: "❗️ Zamanlanmış mesajınız «{target}» adresine gönderilemedi (bot artık orada yönetici olmayabilir).",
    send_ask_code: "Göndermek istediğiniz mesaj kodunu gönderin:",
    send_code_not_found: "❗️ Kod bulunamadı. Lütfen kontrol edip tekrar gönderin.",
    send_choose_target: "Bu nereye gönderilsin?",
    send_enter_id_btn: "✏️ Yeni bir ID/kullanıcı adı girin",
    send_ask_target: "Botun yönetici olduğu kanalın/grubun sayısal ID'sini veya @kullaniciadi'nı gönderin:",
    send_not_admin_there: "❗️ Bot orada yönetici değil. Önce botu o kanalda/grupta yönetici yapın, sonra tekrar deneyin.",
    send_success: "✅ Mesaj başarıyla iletildi.",
    send_save_target_q: "Bir sonraki sefer için bu kanal/grup kaydedilsin mi?",
    mychats_title: "🗂 Kayıtlı kanallarınız/gruplarınız:",
    mychats_empty: "Henüz bir şey kaydedilmedi.",
    mychats_add_btn: "➕ Ekle",
    mychats_remove_btn: "❌ Kaldır",
    mychats_add_ask: "Kanalın/grubun sayısal ID'sini veya @kullaniciadi'nı gönderin (bot orada yönetici olmalı):",
    mychats_added: "✅ Kaydedildi: {title}",
    mychats_removed: "✅ Kaldırıldı.",
    mychats_not_admin: "❗️ Bot orada henüz yönetici değil.",
    id_ask: "🆔 Sayısal ID bul\n\n• @kullaniciadi olan herkese açık kanal/grup/kullanıcı → sadece @kullaniciadi gönderin.\n• Özel kullanıcı → mesajlarından birini bana iletin (iletme bilgisini gizlemediyse).\n• Kendiniz → aşağıdaki butona dokunun veya istediğiniz zaman /myid gönderin.\n• Kullanıcı adı olmayan özel grup/kanal → beni oraya yönetici olarak ekleyin, sonra o grupta/kanalda /id gönderin.\n• Ya da o sohbetten bana herhangi bir mesaj iletin.",
    id_myid_btn: "🙋 Kendi ID'm",
    id_user_result: "👤 Kullanıcı\nID: <code>{id}</code>\nAd: {name}\nKullanıcı adı: {username}",
    id_chat_result: "📢 Sohbet\nID: <code>{id}</code>\nTür: {type}\nBaşlık: {title}",
    id_not_found: "❗️ ID bulunamadı. Kullanıcı adının doğru ve herkese açık olduğundan emin olun, ya da iletme bilgisi görünür bir mesaj iletin.",
    id_forward_hidden: "❗️ Bu kullanıcı iletirken hesabını gizledi, bu yüzden Telegram botlara ID'sini vermiyor (kendi gizlilik ayarı).",
    id_group_reply: "🆔 Bu sohbetin ID'si:\n<code>{id}</code>\nTür: {type}",
    admin_panel_title: "🛠 Yönetim paneli:",
    btn_broadcast: "📢 Toplu mesaj",
    btn_stats: "📊 İstatistikler",
    btn_locks: "🔒 Katılım kilitli kanallar",
    btn_wallet: "💳 Cüzdan",
    btn_wallet_edit: "✏️ Cüzdanı ayarla/değiştir",
    broadcast_ask: "Tüm kullanıcılara göndermek istediğiniz mesajı gönderin (herhangi bir tür).",
    broadcast_confirm: "Bu şimdi tüm kullanıcılara gönderilsin mi?",
    broadcast_sending: "⏳ Gönderiliyor… bu biraz zaman alabilir.",
    broadcast_done: "✅ Toplu gönderim tamamlandı.\nBaşarılı: {sent}\nBaşarısız: {failed}",
    stats_title: "📊 Bot istatistikleri\n\n👥 Kullanıcılar: {users}\n💬 İşlenen mesajlar: {messages}\n🔒 Aktif kilitler: {locks}\n💳 Cüzdan ayarlı: {wallet}",
    locks_title: "🔒 Katılım kilitli kanallar/gruplar\nKullanıcılar botu kullanmadan önce bunların hepsine katılmalıdır.",
    locks_add_btn: "➕ Kilit ekle",
    locks_remove_btn: "❌ Kaldır",
    locks_add_ask: "Kanaldan/gruptan bir mesaj iletin veya @kullaniciadi / sayısal ID'sini gönderin.\n⚠️ Bot orada yönetici olmalı.",
    locks_added: "✅ Kilit eklendi: {title}",
    locks_removed: "✅ Kilit kaldırıldı.",
    locks_empty: "Henüz kilit yapılandırılmadı.",
    wallet_title: "💳 Mevcut cüzdan:\n\nAğ/coin: {network}\nAdres: <code>{address}</code>",
    wallet_not_set: "💳 Henüz bir cüzdan ayarlanmadı.",
    wallet_ask_network: "Ağ/coin adını gönderin (örn. TON, TRC20 USDT, BTC):",
    wallet_ask_address: "Şimdi «{network}» için para yatırma adresini gönderin:",
    wallet_saved: "✅ Cüzdan kaydedildi.",
    support_title: "💛 Bu botu destekle",
    support_text: "Bu botu beğendiyseniz, bağış yaparak gelişimini destekleyebilirsiniz:\n\nAğ/coin: {network}\nAdres: <code>{address}</code>\n\nTeşekkürler! 🙏",
    support_no_wallet: "Yönetici henüz bir bağış cüzdanı ayarlamadı.",
    not_admin: "⛔️ Yönetici değilsiniz.",
    join_required_title: "🔒 Bu botu kullanmak için önce aşağıdakilere katılmalısınız:",
    join_check_btn: "✅ Katıldım, tekrar kontrol et",
    join_still_missing: "❗️ Henüz gerekli tüm kanallara/gruplara katılmadınız.",
    btn_stats_code: "📊 İstatistikler",
    btn_edit_buttons: "✏️ Butonları düzenle",
    btn_delete_code: "🗑 Sil",
    code_stats_title: "📊 Mesaj istatistikleri\n\nDoğrudan gönderimler: {sent}\nButonlar: {buttons}\nOluşturuldu: {created}",
    code_deleted: "✅ Mesaj silindi. Bu kod artık çalışmıyor.",
    code_not_owner: "⛔️ Bu mesaj kodu size ait değil.",
    code_gone: "❗️ Bu kod artık mevcut değil (silinmiş olabilir).",
    view_message_btn: "🔗 Mesajı görüntüle",
    generic_error: "⚠️ Bir şeyler ters gitti. Lütfen tekrar deneyin.",
  },
  pt: {
    choose_lang: "🌐 Escolha seu idioma:",
    lang_changed: "✅ Idioma atualizado.",
    main_menu_title: "✨ Menu principal — escolha uma ferramenta:",
    btn_create: "🧩 Criar mensagem",
    btn_send: "📤 Enviar sem citação",
    btn_mychats: "🗂 Meus canais/grupos",
    btn_idfinder: "🆔 Encontrar ID numérico",
    btn_support: "💛 Apoiar o bot",
    btn_admin: "🛠 Painel de administração",
    btn_back: "🔙 Voltar",
    btn_cancel: "✖️ Cancelar",
    btn_skip: "⏭ Pular",
    btn_yes: "✅ Sim",
    btn_no: "❌ Não",
    cancelled: "Cancelado.",
    create_ask_content: "Envie-me a mensagem que deseja (texto, foto, vídeo, arquivo…) exatamente como quer que seja entregue — ela nunca será alterada.",
    create_ask_buttons: "Quer adicionar botões de vidro? Envie assim (texto do botão em uma linha, link na próxima):\n\nLink 1\nhttps://link1.com\nLink 2\nhttps://link2.com\n\nOu toque em «Pular» se não precisar de botões.",
    create_invalid_buttons: "⚠️ Formato errado. Cada botão precisa de 2 linhas: texto, depois um link começando com http(s)://. Tente novamente, ou pule.",
    btn_pick_color: "Escolha uma cor para este botão:\n«{text}»",
    color_primary: "🔵 Primário",
    color_success: "🟢 Sucesso",
    color_danger: "🔴 Perigo",
    color_default: "⚪️ Padrão",
    create_more_buttons_q: "Adicionar outro botão?",
    create_done: "✅ Sua mensagem está pronta!\n\n🔑 Código da mensagem:\n<code>{code}</code>\n\nGuarde este código — use «Enviar sem citação» a qualquer momento para entregar esta mensagem exata a qualquer canal/grupo administrado pelo bot. O mesmo código também permite ver estatísticas, editar botões ou excluir a mensagem (botões abaixo).",
    share_btn: "🔗 Compartilhar",
    send_now_btn: "📤 Enviar sem citação",
    schedule_send_btn: "⏰ Envio agendado",
    schedule_ask_hours: "Envie o número de horas a partir de agora para o envio desta mensagem (ex: 2 ou 0.5):",
    schedule_invalid_hours: "⚠️ Envie um número de horas válido e positivo (ex: 1, 2.5, 24). Máximo 720.",
    schedule_confirmed: "✅ Agendado! Esta mensagem será enviada para «{target}» em {hours}h, por volta de {time}.",
    schedule_delivered: "✅ Sua mensagem agendada foi entregue a «{target}».",
    schedule_failed: "❗️ Falha ao entregar sua mensagem agendada a «{target}» (talvez o bot não seja mais admin lá).",
    send_ask_code: "Envie o código da mensagem que deseja entregar:",
    send_code_not_found: "❗️ Código não encontrado. Verifique e envie novamente.",
    send_choose_target: "Para onde isso deve ser enviado?",
    send_enter_id_btn: "✏️ Digitar um novo ID/nome de usuário",
    send_ask_target: "Envie o ID numérico ou @usuário do canal/grupo onde o bot é admin:",
    send_not_admin_there: "❗️ O bot não é admin lá. Adicione o bot como admin nesse canal/grupo primeiro e tente novamente.",
    send_success: "✅ Mensagem entregue com sucesso.",
    send_save_target_q: "Salvar este canal/grupo para a próxima vez?",
    mychats_title: "🗂 Seus canais/grupos salvos:",
    mychats_empty: "Nada salvo ainda.",
    mychats_add_btn: "➕ Adicionar",
    mychats_remove_btn: "❌ Remover",
    mychats_add_ask: "Envie o ID numérico ou @usuário do canal/grupo (o bot deve ser admin lá):",
    mychats_added: "✅ Salvo: {title}",
    mychats_removed: "✅ Removido.",
    mychats_not_admin: "❗️ O bot ainda não é admin lá.",
    id_ask: "🆔 Encontrar um ID numérico\n\n• Canal/grupo/usuário público com @usuário → basta enviar @usuário.\n• Usuário privado → encaminhe-me uma de suas mensagens (se não tiver ocultado as informações de encaminhamento).\n• Você mesmo → toque no botão abaixo, ou envie /myid a qualquer momento.\n• Grupo/canal privado sem nome de usuário → adicione-me como admin lá, depois envie /id dentro desse grupo/canal.\n• Ou apenas encaminhe-me uma mensagem desse chat.",
    id_myid_btn: "🙋 Meu próprio ID",
    id_user_result: "👤 Usuário\nID: <code>{id}</code>\nNome: {name}\nNome de usuário: {username}",
    id_chat_result: "📢 Chat\nID: <code>{id}</code>\nTipo: {type}\nTítulo: {title}",
    id_not_found: "❗️ Não foi possível encontrar esse ID. Verifique se o nome de usuário está correto e é público, ou encaminhe uma mensagem com as informações de encaminhamento visíveis.",
    id_forward_hidden: "❗️ Este usuário ocultou a conta ao encaminhar, então o Telegram não fornece o ID dele aos bots (configuração de privacidade do próprio usuário).",
    id_group_reply: "🆔 ID deste chat:\n<code>{id}</code>\nTipo: {type}",
    admin_panel_title: "🛠 Painel de administração:",
    btn_broadcast: "📢 Transmissão",
    btn_stats: "📊 Estatísticas",
    btn_locks: "🔒 Canais de entrada obrigatória",
    btn_wallet: "💳 Carteira",
    btn_wallet_edit: "✏️ Definir/alterar carteira",
    broadcast_ask: "Envie a mensagem que deseja transmitir para todos os usuários (qualquer tipo).",
    broadcast_confirm: "Enviar isso para todos os usuários agora?",
    broadcast_sending: "⏳ Enviando… isso pode demorar um pouco.",
    broadcast_done: "✅ Transmissão concluída.\nEnviadas: {sent}\nFalharam: {failed}",
    stats_title: "📊 Estatísticas do bot\n\n👥 Usuários: {users}\n💬 Mensagens processadas: {messages}\n🔒 Bloqueios ativos: {locks}\n💳 Carteira definida: {wallet}",
    locks_title: "🔒 Canais/grupos de entrada obrigatória\nOs usuários devem entrar em todos estes antes de usar o bot.",
    locks_add_btn: "➕ Adicionar bloqueio",
    locks_remove_btn: "❌ Remover",
    locks_add_ask: "Encaminhe uma mensagem do canal/grupo, ou envie seu @usuário / ID numérico.\n⚠️ O bot deve ser admin lá.",
    locks_added: "✅ Bloqueio adicionado: {title}",
    locks_removed: "✅ Bloqueio removido.",
    locks_empty: "Nenhum bloqueio configurado ainda.",
    wallet_title: "💳 Carteira atual:\n\nRede/moeda: {network}\nEndereço: <code>{address}</code>",
    wallet_not_set: "💳 Nenhuma carteira foi definida ainda.",
    wallet_ask_network: "Envie o nome da rede/moeda (ex.: TON, TRC20 USDT, BTC):",
    wallet_ask_address: "Agora envie o endereço de depósito para «{network}»:",
    wallet_saved: "✅ Carteira salva.",
    support_title: "💛 Apoie este bot",
    support_text: "Se você gosta deste bot, pode apoiar seu desenvolvimento com uma doação:\n\nRede/moeda: {network}\nEndereço: <code>{address}</code>\n\nObrigado! 🙏",
    support_no_wallet: "O admin ainda não definiu uma carteira de doação.",
    not_admin: "⛔️ Você não é admin.",
    join_required_title: "🔒 Para usar este bot, você deve primeiro entrar no seguinte:",
    join_check_btn: "✅ Entrei, verificar novamente",
    join_still_missing: "❗️ Você ainda não entrou em todos os canais/grupos necessários.",
    btn_stats_code: "📊 Estatísticas",
    btn_edit_buttons: "✏️ Editar botões",
    btn_delete_code: "🗑 Excluir",
    code_stats_title: "📊 Estatísticas da mensagem\n\nEnvios diretos: {sent}\nBotões: {buttons}\nCriado: {created}",
    code_deleted: "✅ Mensagem excluída. Este código não funciona mais.",
    code_not_owner: "⛔️ Este código de mensagem não pertence a você.",
    code_gone: "❗️ Este código não existe mais (talvez tenha sido excluído).",
    view_message_btn: "🔗 Ver mensagem",
    generic_error: "⚠️ Algo deu errado. Tente novamente.",
  },
  bn: {
    choose_lang: "🌐 আপনার ভাষা নির্বাচন করুন:",
    lang_changed: "✅ ভাষা আপডেট হয়েছে।",
    main_menu_title: "✨ প্রধান মেনু — একটি টুল বেছে নিন:",
    btn_create: "🧩 বার্তা তৈরি করুন",
    btn_send: "📤 উদ্ধৃতি ছাড়া পাঠান",
    btn_mychats: "🗂 আমার চ্যানেল/গ্রুপ",
    btn_idfinder: "🆔 সাংখ্যিক আইডি খুঁজুন",
    btn_support: "💛 বটকে সহায়তা করুন",
    btn_admin: "🛠 অ্যাডমিন প্যানেল",
    btn_back: "🔙 ফিরে যান",
    btn_cancel: "✖️ বাতিল",
    btn_skip: "⏭ এড়িয়ে যান",
    btn_yes: "✅ হ্যাঁ",
    btn_no: "❌ না",
    cancelled: "বাতিল করা হয়েছে।",
    create_ask_content: "আপনি যে বার্তাটি চান (টেক্সট, ছবি, ভিডিও, ফাইল…) ঠিক যেভাবে পাঠাতে চান সেভাবেই আমাকে পাঠান — এটি কখনো পরিবর্তন করা হবে না।",
    create_ask_buttons: "গ্লাস বাটন যোগ করতে চান? এই ফরম্যাটে পাঠান (এক লাইনে বাটনের টেক্সট, পরের লাইনে লিংক):\n\nলিংক ১\nhttps://link1.com\nলিংক ২\nhttps://link2.com\n\nবাটন না চাইলে «এড়িয়ে যান» চাপুন।",
    create_invalid_buttons: "⚠️ ভুল ফরম্যাট। প্রতিটি বাটনের জন্য ২ লাইন দরকার: টেক্সট, তারপর http(s):// দিয়ে শুরু হওয়া লিংক। আবার চেষ্টা করুন, বা এড়িয়ে যান।",
    btn_pick_color: "এই বাটনের জন্য একটি রং বেছে নিন:\n«{text}»",
    color_primary: "🔵 প্রাইমারি",
    color_success: "🟢 সফলতা",
    color_danger: "🔴 বিপদ",
    color_default: "⚪️ ডিফল্ট",
    create_more_buttons_q: "আরেকটি বাটন যোগ করবেন?",
    create_done: "✅ আপনার বার্তা প্রস্তুত!\n\n🔑 বার্তার কোড:\n<code>{code}</code>\n\nএই কোডটি সংরক্ষণ করুন — যেকোনো সময় «উদ্ধৃতি ছাড়া পাঠান» ব্যবহার করে এই বার্তাটি বট প্রশাসিত যেকোনো চ্যানেল/গ্রুপে হুবহু পাঠান। একই কোড দিয়ে পরিসংখ্যান দেখা, বাটন সম্পাদনা বা বার্তা মুছে ফেলাও সম্ভব (নিচের বাটনগুলো)।",
    share_btn: "🔗 শেয়ার করুন",
    send_now_btn: "📤 উদ্ধৃতি ছাড়া পাঠান",
    schedule_send_btn: "⏰ নির্ধারিত পাঠান",
    schedule_ask_hours: "এই বার্তাটি কত ঘণ্টা পরে পাঠানো হবে তা লিখুন (যেমন 2 বা 0.5):",
    schedule_invalid_hours: "⚠️ অনুগ্রহ করে একটি বৈধ ধনাত্মক ঘণ্টার সংখ্যা পাঠান (যেমন 1, 2.5, 24)। সর্বোচ্চ 720।",
    schedule_confirmed: "✅ নির্ধারিত হয়েছে! এই বার্তাটি {hours} ঘণ্টার মধ্যে, আনুমানিক {time} সময়ে «{target}» এ পাঠানো হবে।",
    schedule_delivered: "✅ আপনার নির্ধারিত বার্তা «{target}» এ পাঠানো হয়েছে।",
    schedule_failed: "❗️ আপনার নির্ধারিত বার্তা «{target}» এ পাঠাতে ব্যর্থ হয়েছে (হয়তো বট আর সেখানে অ্যাডমিন নেই)।",
    send_ask_code: "যে বার্তার কোড পাঠাতে চান তা পাঠান:",
    send_code_not_found: "❗️ কোডটি পাওয়া যায়নি। অনুগ্রহ করে যাচাই করে আবার পাঠান।",
    send_choose_target: "এটি কোথায় পাঠানো হবে?",
    send_enter_id_btn: "✏️ নতুন আইডি/ইউজারনেম লিখুন",
    send_ask_target: "যে চ্যানেল/গ্রুপে বট অ্যাডমিন সেটির সাংখ্যিক আইডি বা @ইউজারনেম পাঠান:",
    send_not_admin_there: "❗️ বট সেখানে অ্যাডমিন নয়। প্রথমে বটকে সেই চ্যানেল/গ্রুপে অ্যাডমিন করুন, তারপর আবার চেষ্টা করুন।",
    send_success: "✅ বার্তা সফলভাবে পাঠানো হয়েছে।",
    send_save_target_q: "পরের বারের জন্য এই চ্যানেল/গ্রুপ সংরক্ষণ করবেন?",
    mychats_title: "🗂 আপনার সংরক্ষিত চ্যানেল/গ্রুপ:",
    mychats_empty: "এখনও কিছু সংরক্ষিত হয়নি।",
    mychats_add_btn: "➕ যোগ করুন",
    mychats_remove_btn: "❌ সরান",
    mychats_add_ask: "চ্যানেল/গ্রুপের সাংখ্যিক আইডি বা @ইউজারনেম পাঠান (বটকে সেখানে অ্যাডমিন হতে হবে):",
    mychats_added: "✅ সংরক্ষিত হয়েছে: {title}",
    mychats_removed: "✅ সরানো হয়েছে।",
    mychats_not_admin: "❗️ বট এখনও সেখানে অ্যাডমিন নয়।",
    id_ask: "🆔 সাংখ্যিক আইডি খুঁজুন\n\n• @ইউজারনেমযুক্ত পাবলিক চ্যানেল/গ্রুপ/ব্যবহারকারী → শুধু @ইউজারনেম পাঠান।\n• প্রাইভেট ব্যবহারকারী → তাদের যেকোনো একটি বার্তা আমাকে ফরওয়ার্ড করুন (যদি তারা ফরওয়ার্ড তথ্য লুকিয়ে না রাখেন)।\n• নিজে → নিচের বাটনে চাপুন, বা যেকোনো সময় /myid পাঠান।\n• ইউজারনেম ছাড়া প্রাইভেট গ্রুপ/চ্যানেল → আমাকে সেখানে অ্যাডমিন করুন, তারপর সেই গ্রুপ/চ্যানেলে /id পাঠান।\n• অথবা শুধু সেই চ্যাট থেকে একটি বার্তা আমাকে ফরওয়ার্ড করুন।",
    id_myid_btn: "🙋 আমার নিজের আইডি",
    id_user_result: "👤 ব্যবহারকারী\nআইডি: <code>{id}</code>\nনাম: {name}\nইউজারনেম: {username}",
    id_chat_result: "📢 চ্যাট\nআইডি: <code>{id}</code>\nধরন: {type}\nশিরোনাম: {title}",
    id_not_found: "❗️ আইডি খুঁজে পাওয়া যায়নি। ইউজারনেম সঠিক ও পাবলিক কিনা নিশ্চিত করুন, অথবা দৃশ্যমান ফরওয়ার্ড তথ্যসহ একটি বার্তা ফরওয়ার্ড করুন।",
    id_forward_hidden: "❗️ এই ব্যবহারকারী ফরওয়ার্ড করার সময় তার অ্যাকাউন্ট লুকিয়েছেন, তাই টেলিগ্রাম বটকে তার আইডি দেয় না (এটি তার নিজস্ব প্রাইভেসি সেটিং)।",
    id_group_reply: "🆔 এই চ্যাটের আইডি:\n<code>{id}</code>\nধরন: {type}",
    admin_panel_title: "🛠 অ্যাডমিন প্যানেল:",
    btn_broadcast: "📢 সম্প্রচার",
    btn_stats: "📊 পরিসংখ্যান",
    btn_locks: "🔒 যোগদান-লক চ্যানেল",
    btn_wallet: "💳 ওয়ালেট",
    btn_wallet_edit: "✏️ ওয়ালেট সেট/পরিবর্তন করুন",
    broadcast_ask: "সব ব্যবহারকারীর কাছে সম্প্রচার করতে চান এমন বার্তা পাঠান (যেকোনো ধরনের)।",
    broadcast_confirm: "এটি এখন সব ব্যবহারকারীর কাছে পাঠাবেন?",
    broadcast_sending: "⏳ পাঠানো হচ্ছে… এতে কিছুটা সময় লাগতে পারে।",
    broadcast_done: "✅ সম্প্রচার সম্পন্ন হয়েছে।\nসফল: {sent}\nব্যর্থ: {failed}",
    stats_title: "📊 বটের পরিসংখ্যান\n\n👥 ব্যবহারকারী: {users}\n💬 প্রক্রিয়াকৃত বার্তা: {messages}\n🔒 সক্রিয় লক: {locks}\n💳 ওয়ালেট সেট: {wallet}",
    locks_title: "🔒 যোগদান-লক চ্যানেল/গ্রুপ\nবট ব্যবহারের আগে ব্যবহারকারীদের এসবের সবগুলোতে যোগ দিতে হবে।",
    locks_add_btn: "➕ লক যোগ করুন",
    locks_remove_btn: "❌ সরান",
    locks_add_ask: "চ্যানেল/গ্রুপ থেকে একটি বার্তা ফরওয়ার্ড করুন, বা এর @ইউজারনেম/সাংখ্যিক আইডি পাঠান।\n⚠️ বটকে সেখানে অ্যাডমিন হতে হবে।",
    locks_added: "✅ লক যোগ করা হয়েছে: {title}",
    locks_removed: "✅ লক সরানো হয়েছে।",
    locks_empty: "এখনও কোনো লক কনফিগার করা হয়নি।",
    wallet_title: "💳 বর্তমান ওয়ালেট:\n\nনেটওয়ার্ক/কয়েন: {network}\nঠিকানা: <code>{address}</code>",
    wallet_not_set: "💳 এখনও কোনো ওয়ালেট সেট করা হয়নি।",
    wallet_ask_network: "নেটওয়ার্ক/কয়েনের নাম পাঠান (যেমন TON, TRC20 USDT, BTC):",
    wallet_ask_address: "এখন «{network}»-এর জন্য জমার ঠিকানা পাঠান:",
    wallet_saved: "✅ ওয়ালেট সংরক্ষিত হয়েছে।",
    support_title: "💛 এই বটকে সহায়তা করুন",
    support_text: "আপনি যদি এই বটটি পছন্দ করেন, তাহলে দান করে এর উন্নয়নে সহায়তা করতে পারেন:\n\nনেটওয়ার্ক/কয়েন: {network}\nঠিকানা: <code>{address}</code>\n\nধন্যবাদ! 🙏",
    support_no_wallet: "অ্যাডমিন এখনও দানের জন্য ওয়ালেট সেট করেননি।",
    not_admin: "⛔️ আপনি অ্যাডমিন নন।",
    join_required_title: "🔒 এই বট ব্যবহার করতে হলে প্রথমে আপনাকে নিম্নলিখিত বিষয়ে যোগ দিতে হবে:",
    join_check_btn: "✅ আমি যোগ দিয়েছি, আবার যাচাই করুন",
    join_still_missing: "❗️ আপনি এখনও সব প্রয়োজনীয় চ্যানেল/গ্রুপে যোগ দেননি।",
    btn_stats_code: "📊 পরিসংখ্যান",
    btn_edit_buttons: "✏️ বাটন সম্পাদনা করুন",
    btn_delete_code: "🗑 মুছুন",
    code_stats_title: "📊 বার্তার পরিসংখ্যান\n\nসরাসরি পাঠানো: {sent}\nবাটন: {buttons}\nতৈরি হয়েছে: {created}",
    code_deleted: "✅ বার্তা মুছে ফেলা হয়েছে। এই কোডটি আর কাজ করবে না।",
    code_not_owner: "⛔️ এই বার্তার কোডটি আপনার নয়।",
    code_gone: "❗️ এই কোডটি আর নেই (হয়তো মুছে ফেলা হয়েছে)।",
    view_message_btn: "🔗 বার্তা দেখুন",
    generic_error: "⚠️ কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
  },
  ur: {
    choose_lang: "🌐 اپنی زبان منتخب کریں:",
    lang_changed: "✅ زبان اپ ڈیٹ ہو گئی۔",
    main_menu_title: "✨ مرکزی مینو — ایک ٹول منتخب کریں:",
    btn_create: "🧩 پیغام بنائیں",
    btn_send: "📤 بغیر حوالے کے بھیجیں",
    btn_mychats: "🗂 میرے چینلز/گروپس",
    btn_idfinder: "🆔 عددی آئی ڈی تلاش کریں",
    btn_support: "💛 بوٹ کی مدد کریں",
    btn_admin: "🛠 ایڈمن پینل",
    btn_back: "🔙 واپس",
    btn_cancel: "✖️ منسوخ کریں",
    btn_skip: "⏭ نظرانداز کریں",
    btn_yes: "✅ ہاں",
    btn_no: "❌ نہیں",
    cancelled: "منسوخ کر دیا گیا۔",
    create_ask_content: "جو پیغام آپ چاہتے ہیں (متن، تصویر، ویڈیو، فائل…) بالکل ویسے ہی بھیجیں جیسے آپ چاہتے ہیں یہ پہنچے — اس میں کبھی تبدیلی نہیں کی جائے گی۔",
    create_ask_buttons: "کیا آپ گلاس بٹن شامل کرنا چاہتے ہیں؟ اس فارمیٹ میں بھیجیں (پہلی لائن بٹن کا متن، اگلی لائن لنک):\n\nلنک 1\nhttps://link1.com\nلنک 2\nhttps://link2.com\n\nاگر بٹن نہیں چاہیے تو «نظرانداز کریں» دبائیں۔",
    create_invalid_buttons: "⚠️ غلط فارمیٹ۔ ہر بٹن کے لیے 2 لائنیں درکار ہیں: متن، پھر http(s):// سے شروع ہونے والا لنک۔ دوبارہ کوشش کریں، یا نظرانداز کریں۔",
    btn_pick_color: "اس بٹن کے لیے ایک رنگ منتخب کریں:\n«{text}»",
    color_primary: "🔵 پرائمری",
    color_success: "🟢 کامیابی",
    color_danger: "🔴 خطرہ",
    color_default: "⚪️ ڈیفالٹ",
    create_more_buttons_q: "ایک اور بٹن شامل کریں؟",
    create_done: "✅ آپ کا پیغام تیار ہے!\n\n🔑 پیغام کوڈ:\n<code>{code}</code>\n\nاس کوڈ کو محفوظ رکھیں — «بغیر حوالے کے بھیجیں» کا استعمال کرتے ہوئے کسی بھی وقت اس پیغام کو بوٹ کے زیرِ انتظام کسی بھی چینل/گروپ میں بالکل ویسے ہی بھیجیں۔ یہی کوڈ اعداد و شمار دیکھنے، بٹن ترمیم کرنے یا پیغام حذف کرنے کے لیے بھی استعمال ہوتا ہے (نیچے بٹن)۔",
    share_btn: "🔗 شیئر کریں",
    send_now_btn: "📤 بغیر حوالے کے بھیجیں",
    schedule_send_btn: "⏰ شیڈول بھیجیں",
    schedule_ask_hours: "یہ پیغام کتنے گھنٹے بعد بھیجا جائے، نمبر بھیجیں (مثلاً 2 یا 0.5):",
    schedule_invalid_hours: "⚠️ براہ کرم درست مثبت گھنٹوں کی تعداد بھیجیں (مثلاً 1, 2.5, 24)۔ زیادہ سے زیادہ 720۔",
    schedule_confirmed: "✅ شیڈول ہو گیا! یہ پیغام {hours} گھنٹے میں، تقریباً {time} پر «{target}» کو بھیجا جائے گا۔",
    schedule_delivered: "✅ آپ کا شیڈول شدہ پیغام «{target}» کو بھیج دیا گیا۔",
    schedule_failed: "❗️ آپ کا شیڈول شدہ پیغام «{target}» کو بھیجنا ناکام ہوا (شاید بوٹ اب وہاں ایڈمن نہیں ہے)۔",
    send_ask_code: "جو پیغام کوڈ بھیجنا چاہتے ہیں وہ بھیجیں:",
    send_code_not_found: "❗️ کوڈ نہیں ملا۔ براہ کرم چیک کریں اور دوبارہ بھیجیں۔",
    send_choose_target: "یہ کہاں بھیجا جائے؟",
    send_enter_id_btn: "✏️ نئی آئی ڈی/یوزرنیم درج کریں",
    send_ask_target: "اس چینل/گروپ کی عددی آئی ڈی یا @یوزرنیم بھیجیں جہاں بوٹ ایڈمن ہے:",
    send_not_admin_there: "❗️ بوٹ وہاں ایڈمن نہیں ہے۔ پہلے بوٹ کو اس چینل/گروپ میں ایڈمن بنائیں، پھر دوبارہ کوشش کریں۔",
    send_success: "✅ پیغام کامیابی سے بھیج دیا گیا۔",
    send_save_target_q: "اگلی بار کے لیے یہ چینل/گروپ محفوظ کریں؟",
    mychats_title: "🗂 آپ کے محفوظ شدہ چینلز/گروپس:",
    mychats_empty: "ابھی تک کچھ محفوظ نہیں کیا گیا۔",
    mychats_add_btn: "➕ شامل کریں",
    mychats_remove_btn: "❌ ہٹائیں",
    mychats_add_ask: "چینل/گروپ کی عددی آئی ڈی یا @یوزرنیم بھیجیں (بوٹ کو وہاں ایڈمن ہونا چاہیے):",
    mychats_added: "✅ محفوظ کر دیا گیا: {title}",
    mychats_removed: "✅ ہٹا دیا گیا۔",
    mychats_not_admin: "❗️ بوٹ ابھی تک وہاں ایڈمن نہیں ہے۔",
    id_ask: "🆔 عددی آئی ڈی تلاش کریں\n\n• @یوزرنیم والا عوامی چینل/گروپ/صارف → بس @یوزرنیم بھیجیں۔\n• نجی صارف → ان کا کوئی پیغام مجھے فارورڈ کریں (اگر انہوں نے فارورڈ معلومات چھپائی نہیں)۔\n• خود → نیچے دیا بٹن دبائیں، یا کسی بھی وقت /myid بھیجیں۔\n• یوزرنیم کے بغیر نجی گروپ/چینل → مجھے وہاں ایڈمن بنائیں، پھر اسی گروپ/چینل میں /id بھیجیں۔\n• یا بس اس چیٹ کا کوئی پیغام مجھے فارورڈ کریں۔",
    id_myid_btn: "🙋 میری اپنی آئی ڈی",
    id_user_result: "👤 صارف\nآئی ڈی: <code>{id}</code>\nنام: {name}\nیوزرنیم: {username}",
    id_chat_result: "📢 چیٹ\nآئی ڈی: <code>{id}</code>\nقسم: {type}\nعنوان: {title}",
    id_not_found: "❗️ آئی ڈی نہیں ملی۔ یقینی بنائیں یوزرنیم درست اور عوامی ہے، یا نظر آنے والی فارورڈ معلومات کے ساتھ پیغام فارورڈ کریں۔",
    id_forward_hidden: "❗️ اس صارف نے فارورڈ کرتے وقت اپنا اکاؤنٹ چھپایا ہے، اس لیے ٹیلیگرام بوٹس کو ان کی آئی ڈی نہیں دیتا (یہ صارف کی اپنی رازداری کی ترتیب ہے)۔",
    id_group_reply: "🆔 اس چیٹ کی آئی ڈی:\n<code>{id}</code>\nقسم: {type}",
    admin_panel_title: "🛠 ایڈمن پینل:",
    btn_broadcast: "📢 نشریات",
    btn_stats: "📊 اعداد و شمار",
    btn_locks: "🔒 لازمی رکنیت چینلز",
    btn_wallet: "💳 والیٹ",
    btn_wallet_edit: "✏️ والیٹ سیٹ/تبدیل کریں",
    broadcast_ask: "وہ پیغام بھیجیں جو آپ تمام صارفین کو نشر کرنا چاہتے ہیں (کسی بھی قسم کا)۔",
    broadcast_confirm: "کیا یہ ابھی تمام صارفین کو بھیجا جائے؟",
    broadcast_sending: "⏳ بھیجا جا رہا ہے… اس میں کچھ وقت لگ سکتا ہے۔",
    broadcast_done: "✅ نشریات مکمل ہو گئیں۔\nکامیاب: {sent}\nناکام: {failed}",
    stats_title: "📊 بوٹ کے اعداد و شمار\n\n👥 صارفین: {users}\n💬 پروسیس شدہ پیغامات: {messages}\n🔒 فعال تالے: {locks}\n💳 والیٹ سیٹ: {wallet}",
    locks_title: "🔒 لازمی رکنیت چینلز/گروپس\nبوٹ استعمال کرنے سے پہلے صارفین کو ان سب میں شامل ہونا ضروری ہے۔",
    locks_add_btn: "➕ تالا شامل کریں",
    locks_remove_btn: "❌ ہٹائیں",
    locks_add_ask: "چینل/گروپ سے ایک پیغام فارورڈ کریں، یا اس کا @یوزرنیم/عددی آئی ڈی بھیجیں۔\n⚠️ بوٹ کو وہاں ایڈمن ہونا چاہیے۔",
    locks_added: "✅ تالا شامل کر دیا گیا: {title}",
    locks_removed: "✅ تالا ہٹا دیا گیا۔",
    locks_empty: "ابھی تک کوئی تالا ترتیب نہیں دیا گیا۔",
    wallet_title: "💳 موجودہ والیٹ:\n\nنیٹ ورک/سکہ: {network}\nپتہ: <code>{address}</code>",
    wallet_not_set: "💳 ابھی تک کوئی والیٹ سیٹ نہیں ہوا۔",
    wallet_ask_network: "نیٹ ورک/سکے کا نام بھیجیں (مثلاً TON, TRC20 USDT, BTC):",
    wallet_ask_address: "اب «{network}» کے لیے جمع کرانے کا پتہ بھیجیں:",
    wallet_saved: "✅ والیٹ محفوظ ہو گیا۔",
    support_title: "💛 اس بوٹ کی مدد کریں",
    support_text: "اگر آپ کو یہ بوٹ پسند ہے تو آپ عطیہ دے کر اس کی ترقی میں مدد کر سکتے ہیں:\n\nنیٹ ورک/سکہ: {network}\nپتہ: <code>{address}</code>\n\nشکریہ! 🙏",
    support_no_wallet: "ایڈمن نے ابھی تک عطیہ کے لیے والیٹ سیٹ نہیں کیا۔",
    not_admin: "⛔️ آپ ایڈمن نہیں ہیں۔",
    join_required_title: "🔒 اس بوٹ کو استعمال کرنے کے لیے پہلے آپ کو درج ذیل میں شامل ہونا ضروری ہے:",
    join_check_btn: "✅ میں شامل ہو گیا، دوبارہ چیک کریں",
    join_still_missing: "❗️ آپ ابھی تک تمام ضروری چینلز/گروپس میں شامل نہیں ہوئے۔",
    btn_stats_code: "📊 اعداد و شمار",
    btn_edit_buttons: "✏️ بٹن ترمیم کریں",
    btn_delete_code: "🗑 حذف کریں",
    code_stats_title: "📊 پیغام کے اعداد و شمار\n\nبراہ راست بھیجے گئے: {sent}\nبٹن: {buttons}\nتخلیق: {created}",
    code_deleted: "✅ پیغام حذف کر دیا گیا۔ یہ کوڈ اب کام نہیں کرے گا۔",
    code_not_owner: "⛔️ یہ پیغام کوڈ آپ کا نہیں ہے۔",
    code_gone: "❗️ یہ کوڈ اب موجود نہیں (شاید حذف ہو گیا ہے)۔",
    view_message_btn: "🔗 پیغام دیکھیں",
    generic_error: "⚠️ کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔",
  },
  id: {
    choose_lang: "🌐 Pilih bahasa Anda:",
    lang_changed: "✅ Bahasa diperbarui.",
    main_menu_title: "✨ Menu utama — pilih alat:",
    btn_create: "🧩 Buat pesan",
    btn_send: "📤 Kirim tanpa kutipan",
    btn_mychats: "🗂 Kanal/grup saya",
    btn_idfinder: "🆔 Cari ID numerik",
    btn_support: "💛 Dukung bot",
    btn_admin: "🛠 Panel admin",
    btn_back: "🔙 Kembali",
    btn_cancel: "✖️ Batal",
    btn_skip: "⏭ Lewati",
    btn_yes: "✅ Ya",
    btn_no: "❌ Tidak",
    cancelled: "Dibatalkan.",
    create_ask_content: "Kirimkan pesan yang Anda inginkan (teks, foto, video, file, …) persis seperti yang Anda inginkan untuk dikirim — pesan ini tidak akan pernah diubah.",
    create_ask_buttons: "Ingin menambahkan tombol kaca? Kirim dengan format ini (teks tombol di satu baris, tautan di baris berikutnya):\n\nTautan 1\nhttps://link1.com\nTautan 2\nhttps://link2.com\n\nAtau tekan «Lewati» jika tidak perlu tombol.",
    create_invalid_buttons: "⚠️ Format salah. Setiap tombol memerlukan 2 baris: teks, lalu tautan yang dimulai dengan http(s)://. Coba lagi, atau lewati.",
    btn_pick_color: "Pilih warna untuk tombol ini:\n«{text}»",
    color_primary: "🔵 Utama",
    color_success: "🟢 Sukses",
    color_danger: "🔴 Bahaya",
    color_default: "⚪️ Default",
    create_more_buttons_q: "Tambahkan tombol lain?",
    create_done: "✅ Pesan Anda sudah siap!\n\n🔑 Kode pesan:\n<code>{code}</code>\n\nSimpan kode ini — gunakan «Kirim tanpa kutipan» kapan saja untuk mengirim pesan persis ini ke kanal/grup mana pun yang dikelola bot. Kode yang sama juga memungkinkan Anda melihat statistik, mengedit tombol, atau menghapus pesan (tombol di bawah).",
    share_btn: "🔗 Bagikan",
    send_now_btn: "📤 Kirim tanpa kutipan",
    schedule_send_btn: "⏰ Kirim terjadwal",
    schedule_ask_hours: "Kirim jumlah jam dari sekarang agar pesan ini dikirim setelahnya (mis. 2 atau 0.5):",
    schedule_invalid_hours: "⚠️ Kirim jumlah jam yang valid dan positif (mis. 1, 2.5, 24). Maksimum 720.",
    schedule_confirmed: "✅ Terjadwal! Pesan ini akan dikirim ke «{target}» dalam {hours} jam, sekitar {time}.",
    schedule_delivered: "✅ Pesan terjadwal Anda telah dikirim ke «{target}».",
    schedule_failed: "❗️ Gagal mengirim pesan terjadwal Anda ke «{target}» (mungkin bot bukan lagi admin di sana).",
    send_ask_code: "Kirim kode pesan yang ingin Anda kirimkan:",
    send_code_not_found: "❗️ Kode tidak ditemukan. Silakan periksa dan kirim lagi.",
    send_choose_target: "Ke mana ini harus dikirim?",
    send_enter_id_btn: "✏️ Masukkan ID/username baru",
    send_ask_target: "Kirim ID numerik atau @username kanal/grup tempat bot menjadi admin:",
    send_not_admin_there: "❗️ Bot bukan admin di sana. Jadikan bot admin di kanal/grup itu terlebih dahulu, lalu coba lagi.",
    send_success: "✅ Pesan berhasil dikirim.",
    send_save_target_q: "Simpan kanal/grup ini untuk lain kali?",
    mychats_title: "🗂 Kanal/grup tersimpan Anda:",
    mychats_empty: "Belum ada yang disimpan.",
    mychats_add_btn: "➕ Tambah",
    mychats_remove_btn: "❌ Hapus",
    mychats_add_ask: "Kirim ID numerik atau @username kanal/grup (bot harus menjadi admin di sana):",
    mychats_added: "✅ Disimpan: {title}",
    mychats_removed: "✅ Dihapus.",
    mychats_not_admin: "❗️ Bot belum menjadi admin di sana.",
    id_ask: "🆔 Cari ID numerik\n\n• Kanal/grup/pengguna publik dengan @username → cukup kirim @username.\n• Pengguna pribadi → teruskan salah satu pesan mereka kepada saya (jika mereka tidak menyembunyikan info penerusan).\n• Diri Anda sendiri → tekan tombol di bawah, atau kirim /myid kapan saja.\n• Grup/kanal pribadi tanpa username → tambahkan saya sebagai admin di sana, lalu kirim /id di dalam grup/kanal tersebut.\n• Atau cukup teruskan pesan apa pun dari obrolan itu kepada saya.",
    id_myid_btn: "🙋 ID saya sendiri",
    id_user_result: "👤 Pengguna\nID: <code>{id}</code>\nNama: {name}\nUsername: {username}",
    id_chat_result: "📢 Obrolan\nID: <code>{id}</code>\nJenis: {type}\nJudul: {title}",
    id_not_found: "❗️ ID tidak ditemukan. Pastikan username benar dan publik, atau teruskan pesan dengan info penerusan yang terlihat.",
    id_forward_hidden: "❗️ Pengguna ini menyembunyikan akunnya saat meneruskan, jadi Telegram tidak memberikan ID mereka kepada bot (pengaturan privasi pengguna itu sendiri).",
    id_group_reply: "🆔 ID obrolan ini:\n<code>{id}</code>\nJenis: {type}",
    admin_panel_title: "🛠 Panel admin:",
    btn_broadcast: "📢 Siaran",
    btn_stats: "📊 Statistik",
    btn_locks: "🔒 Kanal wajib bergabung",
    btn_wallet: "💳 Dompet",
    btn_wallet_edit: "✏️ Atur/ubah dompet",
    broadcast_ask: "Kirim pesan yang ingin Anda siarkan ke semua pengguna (jenis apa pun).",
    broadcast_confirm: "Kirim ini ke semua pengguna sekarang?",
    broadcast_sending: "⏳ Mengirim… ini mungkin memerlukan waktu.",
    broadcast_done: "✅ Siaran selesai.\nTerkirim: {sent}\nGagal: {failed}",
    stats_title: "📊 Statistik bot\n\n👥 Pengguna: {users}\n💬 Pesan diproses: {messages}\n🔒 Kunci aktif: {locks}\n💳 Dompet diatur: {wallet}",
    locks_title: "🔒 Kanal/grup wajib bergabung\nPengguna harus bergabung dengan semua ini sebelum menggunakan bot.",
    locks_add_btn: "➕ Tambah kunci",
    locks_remove_btn: "❌ Hapus",
    locks_add_ask: "Teruskan pesan dari kanal/grup, atau kirim @username/ID numeriknya.\n⚠️ Bot harus menjadi admin di sana.",
    locks_added: "✅ Kunci ditambahkan: {title}",
    locks_removed: "✅ Kunci dihapus.",
    locks_empty: "Belum ada kunci yang dikonfigurasi.",
    wallet_title: "💳 Dompet saat ini:\n\nJaringan/koin: {network}\nAlamat: <code>{address}</code>",
    wallet_not_set: "💳 Belum ada dompet yang diatur.",
    wallet_ask_network: "Kirim nama jaringan/koin (mis. TON, TRC20 USDT, BTC):",
    wallet_ask_address: "Sekarang kirim alamat setoran untuk «{network}»:",
    wallet_saved: "✅ Dompet disimpan.",
    support_title: "💛 Dukung bot ini",
    support_text: "Jika Anda menyukai bot ini, Anda dapat mendukung pengembangannya dengan donasi:\n\nJaringan/koin: {network}\nAlamat: <code>{address}</code>\n\nTerima kasih! 🙏",
    support_no_wallet: "Admin belum mengatur dompet donasi.",
    not_admin: "⛔️ Anda bukan admin.",
    join_required_title: "🔒 Untuk menggunakan bot ini, Anda harus terlebih dahulu bergabung dengan yang berikut:",
    join_check_btn: "✅ Saya sudah bergabung, periksa lagi",
    join_still_missing: "❗️ Anda belum bergabung dengan semua kanal/grup yang diperlukan.",
    btn_stats_code: "📊 Statistik",
    btn_edit_buttons: "✏️ Edit tombol",
    btn_delete_code: "🗑 Hapus",
    code_stats_title: "📊 Statistik pesan\n\nKirim langsung: {sent}\nTombol: {buttons}\nDibuat: {created}",
    code_deleted: "✅ Pesan dihapus. Kode ini tidak akan berfungsi lagi.",
    code_not_owner: "⛔️ Kode pesan ini bukan milik Anda.",
    code_gone: "❗️ Kode ini sudah tidak ada lagi (mungkin telah dihapus).",
    view_message_btn: "🔗 Lihat pesan",
    generic_error: "⚠️ Terjadi kesalahan. Silakan coba lagi.",
  },
};

function _v5(_v75, _v76, _v77 = {}) {
  let _v78 = (_v4[_v75] && _v4[_v75][_v76]) || _v4.en[_v76] || _v76;
  for (const _v79 in _v77) _v78 = _v78.split(`{${_v79}}`).join(_v77[_v79]);
  return _v78;
}

// ============================================================
//  Telegram API helper
// ============================================================
function _v6(_v80, _v81, _v82) {
  return fetch(`https://api.telegram.org/bot${_v80.BOT_TOKEN}/${_v81}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(_v82),
  }).then((_v83) => _v83.json());
}

function _v7(_v84) {
  return _v84.BOT_TOKEN.split(":")[0];
}

// Telegram's Markdown parser breaks (and silently drops the whole message)
// on stray underscores/asterisks, which are common in usernames and wallet
// addresses. We use parse_mode "HTML" everywhere instead and escape any
// dynamic text before it goes into a message, which only needs & < > handled.
function _v8(_v85) {
  return String(_v85 == null ? "" : _v85).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// A single malformed value in KV should never take down a whole feature
// silently (this bit us hard with the wallet key). Always parse defensively.
function _v9(_v86, _v87) {
  if (!_v86) return _v87;
  try {
    return JSON.parse(_v86);
  } catch (_v88) {
    return _v87;
  }
}

// Try to edit an existing message; if that fails for any reason (message not
// found, can't be edited, malformed markdown, etc.) fall back to sending a
// brand new message so the user always gets a visible response.
async function _v10(_v89, _v90, _v91, _v92) {
  let _v93 = await _v6(_v89, "editMessageText", { chat_id: _v90, message_id: _v91, ..._v92 });
  if (_v93 && _v93.ok) return _v93;
  _v93 = await _v6(_v89, "sendMessage", { chat_id: _v90, ..._v92 });
  if (_v93 && _v93.ok) return _v93;
  // Last resort: the failure may be caused by unescaped Markdown characters
  // (e.g. an underscore in a wallet address/network name) — retry as plain text.
  const { parse_mode, ..._v94 } = _v92;
  return _v6(_v89, "sendMessage", { chat_id: _v90, ..._v94 });
}

function _v11(_v95, _v96, _v97) {
  const _v98 = { text: _v95, callback_data: _v96 };
  if (_v97) _v98.style = _v97;
  return _v98;
}
function _v12(_v99, _v100, _v101) {
  const _v102 = { text: _v99, url: _v100 };
  if (_v101) _v102.style = _v101;
  return _v102;
}
function _v13(_v103, _v104, _v105) {
  const _v106 = { text: _v103, switch_inline_query: _v104 };
  if (_v105) _v106.style = _v105;
  return _v106;
}
function _v14(..._v107) {
  return { inline_keyboard: _v107 };
}

// ============================================================
//  D1 helpers
//  The bot now stores everything in a single "kv" table inside a
//  D1 database (env.DB), keeping the exact same key/value shape it
//  used to have in Workers KV. This means every function below has
//  the same name and return type as before — nothing that calls
//  getUser/saveUser/getLocks/etc. anywhere else in this file needed
//  to change.
// ============================================================
const _v15 = (_v108) => `user:${_v108}`;
const _v16 = (_v109) => `regchats:${_v109}`;
const _v17 = (_v110) => `msg:${_v110}`;

async function _v18(_v111, _v112) {
  const _v113 = await _v111.DB.prepare("SELECT value FROM kv WHERE key = ?").bind(_v112).first();
  return _v113 ? _v113.value : null;
}
async function _v19(_v114, _v115, _v116) {
  await _v114.DB.prepare(
    "INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).bind(_v115, _v116).run();
}
async function _v20(_v117, _v118) {
  await _v117.DB.prepare("DELETE FROM kv WHERE key = ?").bind(_v118).run();
}
async function _v21(_v119, _v120) {
  const { results } = await _v119.DB.prepare("SELECT key FROM kv WHERE key LIKE ? || '%'").bind(_v120).all();
  return results.map((_v121) => _v121.key);
}

async function _v22(_v122, _v123) {
  const _v124 = await _v18(_v122, _v15(_v123));
  return _v9(_v124, null);
}
async function _v23(_v125, _v126, _v127) {
  await _v19(_v125, _v15(_v126), JSON.stringify(_v127));
}
async function _v24(_v128, _v129) {
  let _v130 = await _v22(_v128, _v129.id);
  if (_v130) return { user: _v130, isNew: false };
  _v130 = {
    id: _v129.id,
    username: _v129.username || null,
    first_name: _v129.first_name || "",
    lang: null,
    state: null,
    temp: {},
    created_at: Date.now(),
  };
  await _v23(_v128, _v129.id, _v130);
  return { user: _v130, isNew: true };
}

async function _v25(_v131) {
  const _v132 = await _v18(_v131, "admins");
  const _v133 = _v9(_v132, []);
  if (_v131.ADMIN_IDS) {
    for (const _v134 of _v131.ADMIN_IDS.split(",")) {
      const _v135 = parseInt(_v134.trim(), 10);
      if (_v135 && !_v133.includes(_v135)) _v133.push(_v135);
    }
  }
  return _v133;
}
async function _v26(_v136, _v137) {
  return (await _v25(_v136)).includes(_v137);
}

async function _v27(_v138) {
  const _v139 = await _v18(_v138, "locks");
  return _v9(_v139, []);
}
async function _v28(_v140, _v141) {
  await _v19(_v140, "locks", JSON.stringify(_v141));
}

async function _v29(_v142) {
  const _v143 = await _v18(_v142, "wallet");
  if (!_v143) return null;
  try {
    const _v144 = JSON.parse(_v143);
    if (_v144 && typeof _v144 === "object" && _v144.address) return _v144;
    return null;
  } catch (_v145) {
    // An earlier version of this bot stored the wallet as a plain string
    // (not JSON). Recover it instead of throwing, which was silently
    // breaking the wallet/support/stats buttons on every single call.
    return { network: "-", address: _v143 };
  }
}
async function _v30(_v146, _v147, _v148) {
  await _v19(_v146, "wallet", JSON.stringify({ network: _v147, address: _v148 }));
}

async function _v31(_v149, _v150) {
  const _v151 = await _v18(_v149, _v16(_v150));
  return _v9(_v151, []);
}
async function _v32(_v152, _v153, _v154) {
  await _v19(_v152, _v16(_v153), JSON.stringify(_v154));
}

async function _v33(_v155) {
  const _v156 = await _v18(_v155, "stats:messages");
  const _v157 = (_v156 ? parseInt(_v156, 10) : 0) + 1;
  await _v19(_v155, "stats:messages", String(_v157));
  return _v157;
}

async function _v34(_v158) {
  const _v159 = await _v21(_v158, "user:");
  return _v159.length;
}

async function* _v35(_v160) {
  const _v161 = await _v21(_v160, "user:");
  for (const _v162 of _v161) yield _v162.slice("user:".length);
}

function _v36(_v163 = 28) {
  const _v164 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const _v165 = new Uint8Array(_v163);
  crypto.getRandomValues(_v165);
  let _v166 = "";
  for (let _v167 = 0; _v167 < _v163; _v167++) _v166 += _v164[_v165[_v167] % _v164.length];
  return _v166;
}

// ============================================================
//  Content helpers
// ============================================================
function _v37(_v168) {
  if (_v168.text) return { content_type: "text", text: _v168.text, entities: _v168.entities || [], file_id: null, shareable: true };
  if (_v168.photo) {
    const _v169 = _v168.photo[_v168.photo.length - 1];
    return { content_type: "photo", text: _v168.caption || "", entities: _v168.caption_entities || [], file_id: _v169.file_id, shareable: true };
  }
  if (_v168.video) return { content_type: "video", text: _v168.caption || "", entities: _v168.caption_entities || [], file_id: _v168.video.file_id, shareable: true };
  if (_v168.document) return { content_type: "document", text: _v168.caption || "", entities: _v168.caption_entities || [], file_id: _v168.document.file_id, shareable: true };
  if (_v168.animation) return { content_type: "animation", text: _v168.caption || "", entities: _v168.caption_entities || [], file_id: _v168.animation.file_id, shareable: true };
  if (_v168.audio) return { content_type: "audio", text: _v168.caption || "", entities: _v168.caption_entities || [], file_id: _v168.audio.file_id, shareable: true };
  if (_v168.voice) return { content_type: "voice", text: "", entities: [], file_id: _v168.voice.file_id, shareable: true };
  if (_v168.sticker) return { content_type: "sticker", text: "", entities: [], file_id: _v168.sticker.file_id, shareable: true };
  return { content_type: "other", text: _v168.caption || "", entities: _v168.caption_entities || [], file_id: null, shareable: false };
}

function _v38(_v170) {
  const _v171 = _v170.split("\n").map((_v173) => _v173.trim()).filter((_v174) => _v174.length > 0);
  if (_v171.length === 0 || _v171.length % 2 !== 0) return null;
  const _v172 = [];
  for (let _v175 = 0; _v175 < _v171.length; _v175 += 2) {
    const _v176 = _v171[_v175];
    const _v177 = _v171[_v175 + 1];
    if (!/^https?:\/\//i.test(_v177)) return null;
    _v172.push({ text: _v176, url: _v177 });
  }
  return _v172;
}

async function _v39(_v178, _v179) {
  try {
    const _v180 = await _v6(_v178, "getChatMember", { chat_id: _v179, user_id: _v7(_v178) });
    return _v180.ok && ["administrator", "creator"].includes(_v180.result.status);
  } catch (_v181) {
    return false;
  }
}

function _v40(_v182) {
  const _v183 = _v182.trim();
  if (/^-?\d+$/.test(_v183)) return _v183;
  return _v183.startsWith("@") ? _v183 : `@${_v183}`;
}

async function _v41(_v184, _v185, _v186) {
  const _v187 = await _v18(_v184, _v17(_v185));
  if (!_v187) return { ok: false, error: "not_found" };
  const _v188 = _v9(_v187, null);
  if (!_v188) return { ok: false, error: "corrupted" };
  const _v189 = { chat_id: _v186, from_chat_id: _v188.source_chat_id, message_id: _v188.source_message_id };
  if (_v188.buttons && _v188.buttons.length) _v189.reply_markup = { inline_keyboard: _v188.buttons };
  const _v190 = await _v6(_v184, "copyMessage", _v189);
  if (_v190.ok) {
    _v188.sent_count = (_v188.sent_count || 0) + 1;
    await _v19(_v184, _v17(_v185), JSON.stringify(_v188));
  }
  return _v190;
}

function _v42(_v191, _v192) {
  if (_v191.username) return `https://t.me/${_v191.username}/${_v192}`;
  const _v193 = String(_v191.id);
  const _v194 = _v193.startsWith("-100") ? _v193.slice(4) : _v193.replace(/^-/, "");
  return `https://t.me/c/${_v194}/${_v192}`;
}

// ============================================================
//  Scheduled sending ("Send with schedule")
//  Records live in KV under sched:<id> and are picked up by the
//  Cron Trigger (see the `scheduled` handler near the bottom of
//  this file). Each record is self-contained so delivery doesn't
//  need the owner's user object.
// ============================================================
const _v43 = (_v195) => `sched:${_v195}`;
const _v44 = 720; // 30 days safety cap

function _v45(_v196) {
  const _v197 = parseFloat(String(_v196 || "").trim().replace(",", "."));
  if (!isFinite(_v197) || _v197 <= 0 || _v197 > _v44) return null;
  return _v197;
}

function _v46(_v198) {
  const _v199 = (_v198 - Date.now()) / 3600000;
  return (Math.round(_v199 * 100) / 100).toString();
}

function _v47(_v200) {
  const _v201 = new Date(_v200);
  const _v202 = (_v203) => String(_v203).padStart(2, "0");
  return `${_v201.getUTCFullYear()}-${_v202(_v201.getUTCMonth() + 1)}-${_v202(_v201.getUTCDate())} ${_v202(_v201.getUTCHours())}:${_v202(_v201.getUTCMinutes())} UTC`;
}

async function _v48(_v204, _v205, _v206, _v207, _v208, _v209, _v210) {
  const _v211 = `${_v207}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const _v212 = {
    id: _v211,
    code: _v205,
    target_chat_id: _v206.id,
    target_username: _v206.username || null,
    target_title: _v206.title || _v206.username || String(_v206.id),
    owner_id: _v208,
    owner_chat_id: _v209,
    lang: _v210 || "en",
    send_at: _v207,
    created_at: Date.now(),
  };
  await _v19(_v204, _v43(_v211), JSON.stringify(_v212));
  return _v212;
}

// Called from the Cron Trigger. Walks every pending schedule, delivers the
// ones whose time has come, and notifies the owner of the outcome.
async function _v49(_v213) {
  const _v214 = Date.now();
  const _v215 = await _v21(_v213, "sched:");
  for (const _v216 of _v215) {
    const _v217 = await _v18(_v213, _v216);
    const _v218 = _v9(_v217, null);
    if (!_v218) {
      await _v20(_v213, _v216).catch(() => {});
      continue;
    }
    if (_v218.send_at > _v214) continue; // not due yet

    const _v219 = await _v41(_v213, _v218.code, _v218.target_chat_id).catch(() => ({ ok: false }));
    await _v20(_v213, _v216).catch(() => {});
    const _v220 = _v218.lang || "en";
    const _v221 = _v8(_v218.target_title);
    if (_v219 && _v219.ok) {
      await _v6(_v213, "sendMessage", { chat_id: _v218.owner_chat_id, text: _v5(_v220, "schedule_delivered", { target: _v221 }) }).catch(() => {});
    } else {
      await _v6(_v213, "sendMessage", { chat_id: _v218.owner_chat_id, text: _v5(_v220, "schedule_failed", { target: _v221 }) }).catch(() => {});
    }
  }
}

// ============================================================
//  UI builders
// ============================================================
function _v50() {
  const _v222 = _v2.map((_v224) => _v11(_v3[_v224], `setlang:${_v224}`));
  const _v223 = [];
  for (let _v225 = 0; _v225 < _v222.length; _v225 += 2) _v223.push(_v222.slice(_v225, _v225 + 2));
  return _v14(..._v223);
}

function _v51(_v226, _v227) {
  const _v228 = [
    [_v11(_v5(_v226, "btn_create"), "menu:create", "primary")],
    [_v11(_v5(_v226, "btn_send"), "menu:send", "success"), _v11(_v5(_v226, "btn_mychats"), "menu:mychats")],
    [_v11(_v5(_v226, "btn_idfinder"), "menu:id")],
    [_v11(_v5(_v226, "btn_support"), "menu:support", "danger")],
  ];
  if (_v227) _v228.push([_v11(_v5(_v226, "btn_admin"), "menu:admin")]);
  return _v14(..._v228);
}

function _v52(_v229, _v230 = "back:menu") {
  return _v14([_v11(_v5(_v229, "btn_back"), _v230)]);
}
function _v53(_v231) {
  return _v14([_v11(_v5(_v231, "btn_cancel"), "action:cancel")]);
}
function _v54(_v232, _v233) {
  return _v14([_v11(_v5(_v232, "btn_skip"), _v233)], [_v11(_v5(_v232, "btn_cancel"), "action:cancel")]);
}
function _v55(_v234, _v235, _v236) {
  return _v14([_v11(_v5(_v234, "btn_yes"), _v235, "success"), _v11(_v5(_v234, "btn_no"), _v236, "danger")]);
}
function _v56(_v237) {
  return _v14(
    [_v11(_v5(_v237, "color_primary"), "btncolor:primary", "primary"), _v11(_v5(_v237, "color_success"), "btncolor:success", "success")],
    [_v11(_v5(_v237, "color_danger"), "btncolor:danger", "danger"), _v11(_v5(_v237, "color_default"), "btncolor:default")]
  );
}
function _v57(_v238) {
  return _v14(
    [_v11(_v5(_v238, "btn_broadcast"), "admin:broadcast", "primary")],
    [_v11(_v5(_v238, "btn_stats"), "admin:stats")],
    [_v11(_v5(_v238, "btn_locks"), "admin:locks")],
    [_v11(_v5(_v238, "btn_wallet"), "admin:wallet")],
    [_v11(_v5(_v238, "btn_back"), "back:menu")]
  );
}

async function _v58(_v239, _v240, _v241, _v242 = {}) {
  _v240.state = _v241;
  _v240.temp = _v242;
  await _v23(_v239, _v240.id, _v240);
}

async function _v59(_v243, _v244, _v245, _v246) {
  return _v6(_v243, "sendMessage", {
    chat_id: _v244,
    text: _v5(_v245, "main_menu_title"),
    reply_markup: _v51(_v245, _v246),
  });
}

// ============================================================
//  Join-lock enforcement
// ============================================================
async function _v60(_v247, _v248) {
  const _v249 = await _v27(_v247);
  const _v250 = [];
  for (const _v251 of _v249) {
    try {
      const _v252 = await _v6(_v247, "getChatMember", { chat_id: _v251.chat_id, user_id: _v248 });
      const _v253 = _v252.ok ? _v252.result.status : null;
      if (!["creator", "administrator", "member"].includes(_v253)) _v250.push(_v251);
    } catch (_v254) {
      _v250.push(_v251);
    }
  }
  return _v250;
}

async function _v61(_v255, _v256, _v257, _v258) {
  const _v259 = _v258.map((_v260) => [_v12(_v260.title, _v260.invite_link || `https://t.me/${_v260.username}`)]);
  _v259.push([_v11(_v5(_v257, "join_check_btn"), "action:checkjoin", "success")]);
  return _v6(_v255, "sendMessage", {
    chat_id: _v256,
    text: _v5(_v257, "join_required_title"),
    reply_markup: _v14(..._v259),
  });
}

// ============================================================
//  Panels
// ============================================================
async function _v62(_v261, _v262, _v263) {
  const _v264 = await _v27(_v261);
  const _v265 = _v264.map((_v266, _v267) => [_v11(_v266.title, "noop"), _v11(_v5(_v263, "locks_remove_btn"), `admin:lock_del:${_v267}`, "danger")]);
  _v265.push([_v11(_v5(_v263, "locks_add_btn"), "admin:lock_add", "primary")]);
  _v265.push([_v11(_v5(_v263, "btn_back"), "menu:admin")]);
  await _v6(_v261, "sendMessage", {
    chat_id: _v262,
    text: _v264.length ? _v5(_v263, "locks_title") : _v5(_v263, "locks_title") + "\n\n" + _v5(_v263, "locks_empty"),
    reply_markup: _v14(..._v265),
  });
}

async function _v63(_v268, _v269, _v270, _v271) {
  const _v272 = await _v31(_v268, _v271);
  const _v273 = _v272.map((_v274, _v275) => [_v11(_v274.title, "noop"), _v11(_v5(_v270, "mychats_remove_btn"), `mychats:del:${_v275}`, "danger")]);
  _v273.push([_v11(_v5(_v270, "mychats_add_btn"), "mychats:add", "primary")]);
  _v273.push([_v11(_v5(_v270, "btn_back"), "back:menu")]);
  await _v6(_v268, "sendMessage", {
    chat_id: _v269,
    text: _v272.length ? _v5(_v270, "mychats_title") : _v5(_v270, "mychats_title") + "\n\n" + _v5(_v270, "mychats_empty"),
    reply_markup: _v14(..._v273),
  });
}

async function _v64(_v276, _v277, _v278, _v279) {
  const _v280 = await _v31(_v276, _v279);
  const _v281 = _v280.map((_v282, _v283) => [_v11(_v282.title, `sendto:reg:${_v283}`)]);
  _v281.push([_v11(_v5(_v278, "send_enter_id_btn"), "sendto:manual", "primary")]);
  _v281.push([_v11(_v5(_v278, "btn_cancel"), "action:cancel")]);
  await _v6(_v276, "sendMessage", { chat_id: _v277, text: _v5(_v278, "send_choose_target"), reply_markup: _v14(..._v281) });
}

// ============================================================
//  Main update handler
// ============================================================
export async function handleUpdate(_v284, _v285) {
  try {
    if (_v284.callback_query) {
      await _v71(_v284.callback_query, _v285);
    } else if (_v284.message) {
      await _v68(_v284.message, _v285);
    } else if (_v284.my_chat_member) {
      await _v66(_v284.my_chat_member, _v285);
    } else if (_v284.inline_query) {
      await _v67(_v284.inline_query, _v285);
    } else if (_v284.chosen_inline_result) {
      await _v65(_v284.chosen_inline_result, _v285);
    }
  } catch (_v286) {
    console.error("handleUpdate error", _v286);
  }
}

async function _v65(_v287, _v288) {
  const _v289 = _v287.result_id;
  if (!_v289) return;
  const _v290 = await _v18(_v288, _v17(_v289));
  if (!_v290) return;
  const _v291 = _v9(_v290, null);
  if (!_v291) return;
  _v291.sent_count = (_v291.sent_count || 0) + 1;
  await _v19(_v288, _v17(_v289), JSON.stringify(_v291));
}

async function _v66(_v292, _v293) {
  const _v294 = _v292.chat;
  const _v295 = _v292.new_chat_member?.status;
  if (["administrator", "creator"].includes(_v295)) {
    await _v19(_v293, `botchat:${_v294.id}`, JSON.stringify({ id: _v294.id, title: _v294.title, username: _v294.username, type: _v294.type }));
  } else if (["left", "kicked"].includes(_v295)) {
    await _v20(_v293, `botchat:${_v294.id}`);
  }
}

async function _v67(_v296, _v297) {
  const _v298 = (_v296.query || "").trim();
  let _v299 = [];
  if (_v298) {
    const _v300 = await _v18(_v297, _v17(_v298));
    if (_v300) {
      const _v301 = _v9(_v300, null);
      if (_v301) {
      const _v302 = _v301.buttons && _v301.buttons.length ? { inline_keyboard: _v301.buttons } : undefined;
      const _v303 = _v298;
      if (_v301.content_type === "text") {
        _v299.push({
          type: "article",
          id: _v303,
          title: _v301.text ? _v301.text.slice(0, 60) : "Message",
          description: _v301.text ? _v301.text.slice(0, 100) : "",
          input_message_content: { message_text: _v301.text || "", entities: _v301.entities && _v301.entities.length ? _v301.entities : undefined },
          reply_markup: _v302,
        });
      } else if (_v301.content_type === "photo") {
        _v299.push({ type: "photo", id: _v303, photo_file_id: _v301.file_id, caption: _v301.text || undefined, caption_entities: _v301.entities && _v301.entities.length ? _v301.entities : undefined, reply_markup: _v302 });
      } else if (_v301.content_type === "video") {
        _v299.push({ type: "video", id: _v303, video_file_id: _v301.file_id, title: "video", caption: _v301.text || undefined, caption_entities: _v301.entities && _v301.entities.length ? _v301.entities : undefined, reply_markup: _v302 });
      } else if (_v301.content_type === "document") {
        _v299.push({ type: "document", id: _v303, document_file_id: _v301.file_id, title: "file", caption: _v301.text || undefined, caption_entities: _v301.entities && _v301.entities.length ? _v301.entities : undefined, reply_markup: _v302 });
      } else if (_v301.content_type === "animation") {
        _v299.push({ type: "mpeg4_gif", id: _v303, mpeg4_file_id: _v301.file_id, caption: _v301.text || undefined, caption_entities: _v301.entities && _v301.entities.length ? _v301.entities : undefined, reply_markup: _v302 });
      } else if (_v301.content_type === "audio") {
        _v299.push({ type: "audio", id: _v303, audio_file_id: _v301.file_id, title: "audio", caption: _v301.text || undefined, reply_markup: _v302 });
      } else if (_v301.content_type === "voice") {
        _v299.push({ type: "voice", id: _v303, voice_file_id: _v301.file_id, title: "voice", reply_markup: _v302 });
      } else if (_v301.content_type === "sticker") {
        _v299.push({ type: "sticker", id: _v303, sticker_file_id: _v301.file_id, reply_markup: _v302 });
      }
      }
    }
  }
  await _v6(_v297, "answerInlineQuery", { inline_query_id: _v296.id, results: _v299, cache_time: 0, is_personal: true });
}

async function _v68(_v304, _v305) {
  const _v306 = _v304.from;
  if (!_v306 || _v306.is_bot) return;
  const _v307 = _v304.chat.id;
  const _v308 = _v304.text || "";

  // /id works inside groups/channels/supergroups too (diagnostic utility).
  if (_v304.chat.type !== "private") {
    if (_v308 === "/id" || _v308.startsWith("/id@")) {
      await _v6(_v305, "sendMessage", {
        chat_id: _v307,
        reply_to_message_id: _v304.message_id,
        parse_mode: "HTML",
        text: `🆔 Chat ID:\n<code>${_v304.chat.id}</code>\nType: ${_v8(_v304.chat.type)}`,
      });
    }
    return;
  }

  const { user, isNew } = await _v24(_v305, _v306);
  await _v33(_v305);

  if (_v308 === "/start") {
    await _v58(_v305, user, null, {});
    if (!user.lang) {
      // First time ever -> ask for language once (normal notification).
      await _v6(_v305, "sendMessage", {
        chat_id: _v307,
        text: _v5("en", "choose_lang"),
        reply_markup: _v50(),
      });
    } else {
      // Already has a language -> go straight to the main menu, no language prompt.
      await _v59(_v305, _v307, user.lang, await _v26(_v305, _v306.id));
    }
    return;
  }
  if (_v308 === "/lang") {
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(user.lang || "en", "choose_lang"), reply_markup: _v50(), disable_notification: true });
    return;
  }
  if (_v308 === "/myid" || _v308 === "/id") {
    await _v6(_v305, "sendMessage", {
      chat_id: _v307,
      parse_mode: "HTML",
      text: _v5(user.lang || "en", "id_user_result", { id: _v306.id, name: _v8(_v306.first_name + (_v306.last_name ? " " + _v306.last_name : "")), username: _v306.username ? "@" + _v8(_v306.username) : "-" }),
    });
    return;
  }
  if (_v308 === "/cancel") {
    await _v58(_v305, user, null, {});
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(user.lang || "en", "cancelled") });
    await _v59(_v305, _v307, user.lang || "en", await _v26(_v305, _v306.id));
    return;
  }
  if (_v308 === "/admin") {
    if (!(await _v26(_v305, _v306.id))) {
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(user.lang || "en", "not_admin") });
      return;
    }
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(user.lang || "en", "admin_panel_title"), reply_markup: _v57(user.lang || "en") });
    return;
  }

  if (!user.lang) {
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5("en", "choose_lang"), reply_markup: _v50() });
    return;
  }
  const _v309 = user.lang;

  const _v310 = await _v26(_v305, _v306.id);
  if (!_v310) {
    const _v312 = await _v60(_v305, _v306.id);
    if (_v312.length) {
      await _v61(_v305, _v307, _v309, _v312);
      return;
    }
  }

  const _v311 = user.state;

  // ---- Create-message flow ----
  if (_v311 === "awaiting_create_content") {
    const _v313 = _v37(_v304);
    const _v314 = { ..._v313, source_chat_id: _v307, source_message_id: _v304.message_id, buttons: [] };
    await _v58(_v305, user, "awaiting_create_buttons", _v314);
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "create_ask_buttons"), reply_markup: _v54(_v309, "create:skipbuttons") });
    return;
  }

  if (_v311 === "awaiting_create_buttons") {
    if (!_v308) {
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "create_invalid_buttons"), reply_markup: _v54(_v309, "create:skipbuttons") });
      return;
    }
    const _v315 = _v38(_v308);
    if (!_v315) {
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "create_invalid_buttons"), reply_markup: _v54(_v309, "create:skipbuttons") });
      return;
    }
    const _v316 = { ...user.temp, pending_batch: _v315, batch_index: 0 };
    await _v58(_v305, user, "awaiting_create_button_color", _v316);
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "btn_pick_color", { text: _v315[0].text }), reply_markup: _v56(_v309) });
    return;
  }

  // ---- Send-by-code flow ----
  if (_v311 === "awaiting_send_code") {
    const _v317 = _v308.trim();
    const _v318 = await _v18(_v305, _v17(_v317));
    if (!_v318) {
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "send_code_not_found"), reply_markup: _v53(_v309) });
      return;
    }
    await _v58(_v305, user, "awaiting_send_choose_target", { pending_code: _v317 });
    await _v64(_v305, _v307, _v309, _v306.id);
    return;
  }

  // ---- Schedule-send flow: ask "how many hours from now" ----
  if (_v311 === "awaiting_schedule_hours") {
    const _v319 = _v45(_v308);
    if (_v319 === null) {
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "schedule_invalid_hours"), reply_markup: _v53(_v309) });
      return;
    }
    const _v320 = Date.now() + Math.round(_v319 * 3600000);
    await _v58(_v305, user, "awaiting_send_choose_target", { pending_code: user.temp.pending_code, schedule_at: _v320 });
    await _v64(_v305, _v307, _v309, _v306.id);
    return;
  }

  if (_v311 === "awaiting_send_target") {
    const _v321 = user.temp.pending_code;
    const _v322 = user.temp.schedule_at || null;
    const _v323 = _v40(_v308);
    const _v324 = await _v6(_v305, "getChat", { chat_id: _v323 });
    if (!_v324.ok) {
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "id_not_found") });
      return;
    }
    const _v325 = _v324.result;
    const _v326 = await _v39(_v305, _v325.id);
    if (!_v326) {
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "send_not_admin_there"), reply_markup: _v53(_v309) });
      return;
    }

    if (_v322) {
      await _v48(_v305, _v321, _v325, _v322, _v306.id, _v307, _v309);
      const _v329 = _v325.title || _v325.username || String(_v325.id);
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "schedule_confirmed", { target: _v8(_v329), hours: _v46(_v322), time: _v47(_v322) }), parse_mode: "HTML" });
      await _v58(_v305, user, "awaiting_send_save_target", { target_chat_id: _v325.id, target_title: _v329 });
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "send_save_target_q"), reply_markup: _v55(_v309, "send:savechat:yes", "send:savechat:no") });
      return;
    }

    const _v327 = await _v41(_v305, _v321, _v325.id);
    if (!_v327.ok) {
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "generic_error") });
      await _v58(_v305, user, null, {});
      await _v59(_v305, _v307, _v309, _v310);
      return;
    }
    const _v328 = _v42(_v325, _v327.result.message_id);
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "send_success"), reply_markup: _v14([_v12(_v5(_v309, "view_message_btn"), _v328, "primary")]) });
    await _v58(_v305, user, "awaiting_send_save_target", { target_chat_id: _v325.id, target_title: _v325.title || _v325.username || String(_v325.id) });
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "send_save_target_q"), reply_markup: _v55(_v309, "send:savechat:yes", "send:savechat:no") });
    return;
  }

  // ---- My chats registration ----
  if (_v311 === "awaiting_mychats_add") {
    const _v330 = _v40(_v308);
    const _v331 = await _v6(_v305, "getChat", { chat_id: _v330 });
    if (!_v331.ok) {
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "id_not_found") });
      return;
    }
    const _v332 = _v331.result;
    const _v333 = await _v39(_v305, _v332.id);
    if (!_v333) {
      await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "mychats_not_admin"), reply_markup: _v53(_v309) });
      return;
    }
    const _v334 = await _v31(_v305, _v306.id);
    const _v335 = _v332.title || _v332.username || String(_v332.id);
    if (!_v334.find((_v336) => _v336.chat_id === _v332.id)) {
      _v334.push({ chat_id: _v332.id, title: _v335, username: _v332.username || null });
      await _v32(_v305, _v306.id, _v334);
    }
    await _v58(_v305, user, null, {});
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "mychats_added", { title: _v335 }) });
    await _v63(_v305, _v307, _v309, _v306.id);
    return;
  }

  // ---- ID finder ----
  if (_v311 === "awaiting_id_lookup") {
    await _v69(_v305, _v304, user, _v309);
    return;
  }

  // ---- Admin: wallet ----
  if (_v311 === "awaiting_wallet_network") {
    await _v58(_v305, user, "awaiting_wallet_address", { network: _v308.trim() });
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "wallet_ask_address", { network: _v308.trim() }), reply_markup: _v53(_v309) });
    return;
  }
  if (_v311 === "awaiting_wallet_address") {
    await _v30(_v305, user.temp.network, _v308.trim());
    await _v58(_v305, user, null, {});
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "wallet_saved") });
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "admin_panel_title"), reply_markup: _v57(_v309) });
    return;
  }

  // ---- Admin: locks ----
  if (_v311 === "awaiting_lock_add") {
    await _v70(_v305, _v304, user, _v309);
    return;
  }

  // ---- Admin: broadcast ----
  if (_v311 === "awaiting_broadcast") {
    await _v58(_v305, user, "awaiting_broadcast_confirm", { broadcast_chat_id: _v307, broadcast_message_id: _v304.message_id });
    await _v6(_v305, "copyMessage", { chat_id: _v307, from_chat_id: _v307, message_id: _v304.message_id });
    await _v6(_v305, "sendMessage", { chat_id: _v307, text: _v5(_v309, "broadcast_confirm"), reply_markup: _v55(_v309, "admin:broadcast_go", "action:cancel") });
    return;
  }

  await _v59(_v305, _v307, _v309, _v310);
}

async function _v69(_v337, _v338, _v339, _v340) {
  const _v341 = _v338.chat.id;

  const _v342 = _v338.forward_origin;
  if (_v342) {
    if (_v342.type === "user") {
      const _v347 = _v342.sender_user;
      await _v6(_v337, "sendMessage", {
        chat_id: _v341,
        parse_mode: "HTML",
        text: _v5(_v340, "id_user_result", { id: _v347.id, name: _v8(_v347.first_name + (_v347.last_name ? " " + _v347.last_name : "")), username: _v347.username ? "@" + _v8(_v347.username) : "-" }),
      });
      return;
    }
    if (_v342.type === "chat" || _v342.type === "channel") {
      const _v348 = _v342.chat;
      await _v6(_v337, "sendMessage", { chat_id: _v341, parse_mode: "HTML", text: _v5(_v340, "id_chat_result", { id: _v348.id, type: _v8(_v348.type), title: _v8(_v348.title) }) });
      return;
    }
    if (_v342.type === "hidden_user") {
      await _v6(_v337, "sendMessage", { chat_id: _v341, text: _v5(_v340, "id_forward_hidden") });
      return;
    }
  }

  const _v343 = (_v338.text || "").trim();
  if (!_v343) {
    await _v6(_v337, "sendMessage", { chat_id: _v341, text: _v5(_v340, "id_not_found") });
    return;
  }
  const _v344 = _v40(_v343);
  const _v345 = await _v6(_v337, "getChat", { chat_id: _v344 });
  if (!_v345.ok) {
    await _v6(_v337, "sendMessage", { chat_id: _v341, text: _v5(_v340, "id_not_found") });
    return;
  }
  const _v346 = _v345.result;
  if (_v346.type === "private") {
    await _v6(_v337, "sendMessage", {
      chat_id: _v341,
      parse_mode: "HTML",
      text: _v5(_v340, "id_user_result", { id: _v346.id, name: _v8(_v346.first_name + (_v346.last_name ? " " + _v346.last_name : "")), username: _v346.username ? "@" + _v8(_v346.username) : "-" }),
    });
  } else {
    await _v6(_v337, "sendMessage", { chat_id: _v341, parse_mode: "HTML", text: _v5(_v340, "id_chat_result", { id: _v346.id, type: _v8(_v346.type), title: _v8(_v346.title || "-") }) });
  }
}

async function _v70(_v349, _v350, _v351, _v352) {
  const _v353 = _v350.chat.id;
  let _v354 = null;

  const _v355 = _v350.forward_origin;
  if (_v355 && (_v355.type === "chat" || _v355.type === "channel")) {
    _v354 = _v355.chat;
  } else {
    const _v358 = (_v350.text || "").trim();
    if (_v358) {
      const _v359 = await _v6(_v349, "getChat", { chat_id: _v40(_v358) });
      if (_v359.ok) _v354 = _v359.result;
    }
  }

  if (!_v354) {
    await _v6(_v349, "sendMessage", { chat_id: _v353, text: _v5(_v352, "id_not_found") });
    return;
  }

  let _v356 = null;
  try {
    const _v360 = await _v6(_v349, "getChat", { chat_id: _v354.id });
    _v356 = _v360.ok ? _v360.result.invite_link : null;
  } catch (_v361) {}

  const _v357 = await _v27(_v349);
  if (!_v357.find((_v362) => _v362.chat_id === _v354.id)) {
    _v357.push({ chat_id: _v354.id, title: _v354.title || _v354.username || String(_v354.id), username: _v354.username || null, invite_link: _v356 });
    await _v28(_v349, _v357);
  }

  await _v58(_v349, _v351, null, {});
  await _v6(_v349, "sendMessage", { chat_id: _v353, text: _v5(_v352, "locks_added", { title: _v354.title || _v354.username }) });
  await _v62(_v349, _v353, _v352);
}

// ============================================================
//  Callback query handler
// ============================================================
async function _v71(_v363, _v364) {
  const _v365 = _v363.from;
  const _v366 = _v363.message.chat.id;
  const _v367 = _v363.message.message_id;
  const _v368 = _v363.data || "";
  const { user } = await _v24(_v364, _v365);
  const _v369 = user.lang || "en";

  await _v6(_v364, "answerCallbackQuery", { callback_query_id: _v363.id });
  if (_v368 === "noop") return;

  if (_v368.startsWith("setlang:")) {
    const _v370 = _v368.split(":")[1];
    user.lang = _v370;
    user.state = null;
    user.temp = {};
    await _v23(_v364, user.id, user);
    await _v6(_v364, "deleteMessage", { chat_id: _v366, message_id: _v367 }).catch(() => {});
    await _v59(_v364, _v366, _v370, await _v26(_v364, _v365.id));
    return;
  }

  if (_v368 === "action:cancel") {
    await _v58(_v364, user, null, {});
    await _v10(_v364, _v366, _v367, { text: _v5(_v369, "cancelled") });
    await _v59(_v364, _v366, _v369, await _v26(_v364, _v365.id));
    return;
  }

  if (_v368 === "action:checkjoin") {
    const _v371 = await _v60(_v364, _v365.id);
    if (_v371.length === 0) {
      await _v6(_v364, "deleteMessage", { chat_id: _v366, message_id: _v367 }).catch(() => {});
      await _v59(_v364, _v366, _v369, await _v26(_v364, _v365.id));
    } else {
      await _v6(_v364, "answerCallbackQuery", { callback_query_id: _v363.id, text: _v5(_v369, "join_still_missing"), show_alert: true });
    }
    return;
  }

  if (_v368 === "back:menu") {
    await _v6(_v364, "deleteMessage", { chat_id: _v366, message_id: _v367 }).catch(() => {});
    await _v58(_v364, user, null, {});
    await _v59(_v364, _v366, _v369, await _v26(_v364, _v365.id));
    return;
  }

  // ---- Main menu ----
  if (_v368 === "menu:create") {
    await _v58(_v364, user, "awaiting_create_content", {});
    await _v10(_v364, _v366, _v367, { text: _v5(_v369, "create_ask_content"), reply_markup: _v53(_v369) });
    return;
  }
  if (_v368 === "menu:send") {
    await _v58(_v364, user, "awaiting_send_code", {});
    await _v10(_v364, _v366, _v367, { text: _v5(_v369, "send_ask_code"), reply_markup: _v53(_v369) });
    return;
  }
  if (_v368 === "menu:mychats") {
    await _v6(_v364, "deleteMessage", { chat_id: _v366, message_id: _v367 }).catch(() => {});
    await _v63(_v364, _v366, _v369, _v365.id);
    return;
  }
  if (_v368 === "menu:id") {
    await _v58(_v364, user, "awaiting_id_lookup", {});
    await _v10(_v364, _v366, _v367, {
      text: _v5(_v369, "id_ask"),
      reply_markup: _v14([_v11(_v5(_v369, "id_myid_btn"), "id:myid", "primary")], [_v11(_v5(_v369, "btn_cancel"), "action:cancel")]),
    });
    return;
  }
  if (_v368 === "id:myid") {
    await _v6(_v364, "sendMessage", {
      chat_id: _v366,
      parse_mode: "HTML",
      text: _v5(_v369, "id_user_result", { id: _v365.id, name: _v8(_v365.first_name + (_v365.last_name ? " " + _v365.last_name : "")), username: _v365.username ? "@" + _v8(_v365.username) : "-" }),
    });
    return;
  }
  if (_v368 === "menu:support") {
    const _v372 = await _v29(_v364);
    await _v10(_v364, _v366, _v367, {
      parse_mode: "HTML",
      text: _v372 ? _v5(_v369, "support_text", { network: _v8(_v372.network), address: _v8(_v372.address) }) : _v5(_v369, "support_no_wallet"),
      reply_markup: _v52(_v369),
    });
    return;
  }
  if (_v368 === "menu:admin") {
    if (!(await _v26(_v364, _v365.id))) return;
    await _v10(_v364, _v366, _v367, { text: _v5(_v369, "admin_panel_title"), reply_markup: _v57(_v369) });
    return;
  }

  // ---- Create-message flow ----
  if (_v368 === "create:skipbuttons") {
    await _v72(_v364, _v366, _v367, user, _v369);
    return;
  }
  if (_v368.startsWith("btncolor:")) {
    const _v373 = _v368.split(":")[1];
    const _v374 = user.temp;
    const _v375 = _v374.pending_batch[_v374.batch_index];
    const _v376 = { text: _v375.text, url: _v375.url };
    if (_v373 !== "default") _v376.style = _v373;
    _v374.buttons.push(_v376);
    _v374.batch_index += 1;
    if (_v374.batch_index < _v374.pending_batch.length) {
      await _v58(_v364, user, "awaiting_create_button_color", _v374);
      await _v10(_v364, _v366, _v367, { text: _v5(_v369, "btn_pick_color", { text: _v374.pending_batch[_v374.batch_index].text }), reply_markup: _v56(_v369) });
    } else {
      await _v58(_v364, user, "awaiting_create_more", _v374);
      await _v10(_v364, _v366, _v367, { text: _v5(_v369, "create_more_buttons_q"), reply_markup: _v55(_v369, "create:more:yes", "create:skipbuttons") });
    }
    return;
  }
  if (_v368 === "create:more:yes") {
    await _v58(_v364, user, "awaiting_create_buttons", user.temp);
    await _v10(_v364, _v366, _v367, { text: _v5(_v369, "create_ask_buttons"), reply_markup: _v54(_v369, "create:skipbuttons") });
    return;
  }

  // ---- Send-by-code flow ----
  if (_v368 === "sendto:manual") {
    await _v58(_v364, user, "awaiting_send_target", user.temp);
    await _v10(_v364, _v366, _v367, { text: _v5(_v369, "send_ask_target"), reply_markup: _v53(_v369) });
    return;
  }
  if (_v368.startsWith("sendto:reg:")) {
    const _v377 = parseInt(_v368.split(":")[2], 10);
    const _v378 = await _v31(_v364, _v365.id);
    const _v379 = _v378[_v377];
    if (!_v379) return;
    const _v380 = await _v39(_v364, _v379.chat_id);
    if (!_v380) {
      await _v10(_v364, _v366, _v367, { text: _v5(_v369, "send_not_admin_there") });
      return;
    }
    const _v381 = user.temp.pending_code;
    const _v382 = user.temp.schedule_at || null;

    if (_v382) {
      await _v48(_v364, _v381, { id: _v379.chat_id, username: _v379.username, title: _v379.title }, _v382, _v365.id, _v366, _v369);
      await _v58(_v364, user, null, {});
      await _v10(_v364, _v366, _v367, {
        parse_mode: "HTML",
        text: _v5(_v369, "schedule_confirmed", { target: _v8(_v379.title), hours: _v46(_v382), time: _v47(_v382) }),
      });
      await _v59(_v364, _v366, _v369, await _v26(_v364, _v365.id));
      return;
    }

    const _v383 = await _v41(_v364, _v381, _v379.chat_id);
    await _v58(_v364, user, null, {});
    if (_v383.ok) {
      const _v384 = _v42({ id: _v379.chat_id, username: _v379.username }, _v383.result.message_id);
      await _v10(_v364, _v366, _v367, { text: _v5(_v369, "send_success"), reply_markup: _v14([_v12(_v5(_v369, "view_message_btn"), _v384, "primary")]) });
    } else {
      await _v10(_v364, _v366, _v367, { text: _v5(_v369, "generic_error") });
    }
    await _v59(_v364, _v366, _v369, await _v26(_v364, _v365.id));
    return;
  }
  if (_v368 === "send:savechat:yes") {
    const _v385 = await _v31(_v364, _v365.id);
    const { target_chat_id, target_title } = user.temp;
    if (!_v385.find((_v386) => _v386.chat_id === target_chat_id)) {
      _v385.push({ chat_id: target_chat_id, title: target_title, username: null });
      await _v32(_v364, _v365.id, _v385);
    }
    await _v58(_v364, user, null, {});
    await _v10(_v364, _v366, _v367, { text: _v5(_v369, "mychats_added", { title: target_title }) });
    await _v59(_v364, _v366, _v369, await _v26(_v364, _v365.id));
    return;
  }
  if (_v368 === "send:savechat:no") {
    await _v58(_v364, user, null, {});
    await _v6(_v364, "deleteMessage", { chat_id: _v366, message_id: _v367 }).catch(() => {});
    await _v59(_v364, _v366, _v369, await _v26(_v364, _v365.id));
    return;
  }

  // ---- Quick-send shortcut from the "create done" screen ----
  if (_v368.startsWith("quicksend:")) {
    const _v387 = _v368.slice("quicksend:".length);
    await _v58(_v364, user, "awaiting_send_choose_target", { pending_code: _v387 });
    await _v64(_v364, _v366, _v369, _v365.id);
    return;
  }

  // ---- Schedule-send shortcut from the "create done" screen ----
  if (_v368.startsWith("schedulesend:")) {
    const _v388 = _v368.slice("schedulesend:".length);
    await _v58(_v364, user, "awaiting_schedule_hours", { pending_code: _v388 });
    await _v10(_v364, _v366, _v367, { text: _v5(_v369, "schedule_ask_hours"), reply_markup: _v53(_v369) });
    return;
  }

  // ---- Message-code management: stats / edit buttons / delete ----
  if (_v368.startsWith("code:")) {
    const [, _v389, _v390] = _v368.split(":");
    const _v391 = await _v18(_v364, _v17(_v390));
    if (!_v391) {
      await _v6(_v364, "answerCallbackQuery", { callback_query_id: _v363.id, text: _v5(_v369, "code_gone"), show_alert: true });
      return;
    }
    const _v392 = _v9(_v391, null);
    if (!_v392) {
      await _v6(_v364, "answerCallbackQuery", { callback_query_id: _v363.id, text: _v5(_v369, "code_gone"), show_alert: true });
      return;
    }
    const _v393 = _v392.owner_id === user.id || (await _v26(_v364, _v365.id));
    if (!_v393) {
      await _v6(_v364, "answerCallbackQuery", { callback_query_id: _v363.id, text: _v5(_v369, "code_not_owner"), show_alert: true });
      return;
    }
    if (_v389 === "stats") {
      const _v394 = new Date(_v392.created_at || Date.now()).toISOString().slice(0, 16).replace("T", " ");
      await _v6(_v364, "sendMessage", {
        chat_id: _v366,
        text: _v5(_v369, "code_stats_title", { sent: _v392.sent_count || 0, buttons: (_v392.buttons || []).length, created: _v394 }),
      });
      return;
    }
    if (_v389 === "editbtns") {
      await _v58(_v364, user, "awaiting_create_buttons", {
        edit_code: _v390,
        source_chat_id: _v392.source_chat_id,
        source_message_id: _v392.source_message_id,
        content_type: _v392.content_type,
        text: _v392.text,
        entities: _v392.entities,
        file_id: _v392.file_id,
        shareable: _v392.shareable,
        buttons: [],
      });
      await _v10(_v364, _v366, _v367, { text: _v5(_v369, "create_ask_buttons"), reply_markup: _v54(_v369, "create:skipbuttons") });
      return;
    }
    if (_v389 === "del") {
      await _v20(_v364, _v17(_v390));
      await _v10(_v364, _v366, _v367, { text: _v5(_v369, "code_deleted") });
      return;
    }
  }

  // ---- My chats ----
  if (_v368 === "mychats:add") {
    await _v58(_v364, user, "awaiting_mychats_add", {});
    await _v10(_v364, _v366, _v367, { text: _v5(_v369, "mychats_add_ask"), reply_markup: _v53(_v369) });
    return;
  }
  if (_v368.startsWith("mychats:del:")) {
    const _v395 = parseInt(_v368.split(":")[2], 10);
    const _v396 = await _v31(_v364, _v365.id);
    _v396.splice(_v395, 1);
    await _v32(_v364, _v365.id, _v396);
    await _v6(_v364, "answerCallbackQuery", { callback_query_id: _v363.id, text: _v5(_v369, "mychats_removed") });
    await _v6(_v364, "deleteMessage", { chat_id: _v366, message_id: _v367 }).catch(() => {});
    await _v63(_v364, _v366, _v369, _v365.id);
    return;
  }

  // ---- Admin ----
  if (_v368.startsWith("admin:")) {
    if (!(await _v26(_v364, _v365.id))) return;
    const _v397 = _v368.split(":")[1];

    if (_v397 === "broadcast") {
      await _v58(_v364, user, "awaiting_broadcast", {});
      await _v10(_v364, _v366, _v367, { text: _v5(_v369, "broadcast_ask"), reply_markup: _v53(_v369) });
      return;
    }
    if (_v397 === "broadcast_go") {
      const _v398 = user.temp.broadcast_chat_id;
      const _v399 = user.temp.broadcast_message_id;
      await _v58(_v364, user, null, {});
      await _v10(_v364, _v366, _v367, { text: _v5(_v369, "broadcast_sending") });
      let _v400 = 0, _v401 = 0;
      for await (const _v402 of _v35(_v364)) {
        try {
          const _v403 = await _v6(_v364, "copyMessage", { chat_id: _v402, from_chat_id: _v398, message_id: _v399 });
          if (_v403.ok) _v400++; else _v401++;
        } catch (_v404) {
          _v401++;
        }
        await new Promise((_v405) => setTimeout(_v405, 40));
      }
      await _v6(_v364, "sendMessage", { chat_id: _v366, text: _v5(_v369, "broadcast_done", { sent: _v400, failed: _v401 }) });
      await _v6(_v364, "sendMessage", { chat_id: _v366, text: _v5(_v369, "admin_panel_title"), reply_markup: _v57(_v369) });
      return;
    }
    if (_v397 === "stats") {
      const _v406 = await _v34(_v364);
      const _v407 = (await _v18(_v364, "stats:messages")) || "0";
      const _v408 = (await _v27(_v364)).length;
      const _v409 = (await _v29(_v364)) ? "✅" : "❌";
      await _v10(_v364, _v366, _v367, {
        text: _v5(_v369, "stats_title", { users: _v406, messages: _v407, locks: _v408, wallet: _v409 }),
        reply_markup: _v52(_v369, "menu:admin"),
      });
      return;
    }
    if (_v397 === "locks") {
      await _v6(_v364, "deleteMessage", { chat_id: _v366, message_id: _v367 }).catch(() => {});
      await _v62(_v364, _v366, _v369);
      return;
    }
    if (_v397 === "lock_add") {
      await _v58(_v364, user, "awaiting_lock_add", {});
      await _v10(_v364, _v366, _v367, { text: _v5(_v369, "locks_add_ask"), reply_markup: _v53(_v369) });
      return;
    }
    if (_v397 === "lock_del") {
      const _v410 = parseInt(_v368.split(":")[2], 10);
      const _v411 = await _v27(_v364);
      _v411.splice(_v410, 1);
      await _v28(_v364, _v411);
      await _v6(_v364, "answerCallbackQuery", { callback_query_id: _v363.id, text: _v5(_v369, "locks_removed") });
      await _v6(_v364, "deleteMessage", { chat_id: _v366, message_id: _v367 }).catch(() => {});
      await _v62(_v364, _v366, _v369);
      return;
    }
    if (_v397 === "wallet") {
      const _v412 = await _v29(_v364);
      await _v10(_v364, _v366, _v367, {
        parse_mode: "HTML",
        text: _v412 ? _v5(_v369, "wallet_title", { network: _v8(_v412.network), address: _v8(_v412.address) }) : _v5(_v369, "wallet_not_set"),
        reply_markup: _v14([_v11(_v5(_v369, "btn_wallet_edit"), "admin:wallet_edit", "primary")], [_v11(_v5(_v369, "btn_back"), "menu:admin")]),
      });
      return;
    }
    if (_v397 === "wallet_edit") {
      await _v58(_v364, user, "awaiting_wallet_network", {});
      await _v10(_v364, _v366, _v367, { text: _v5(_v369, "wallet_ask_network"), reply_markup: _v53(_v369) });
      return;
    }
  }
}

async function _v72(_v413, _v414, _v415, _v416, _v417) {
  const _v418 = _v416.temp;
  const _v419 = (_v418.buttons || []).map((_v427) => [_v427]);
  let _v420 = _v418.edit_code || null;
  let _v421 = null;

  if (_v420) {
    const _v428 = await _v18(_v413, _v17(_v420));
    _v421 = _v9(_v428, null);
    if (!_v421) _v420 = null; // record was deleted meanwhile -> fall back to creating a new one
  }
  if (!_v420) {
    _v420 = _v36();
    _v421 = {
      owner_id: _v416.id,
      source_chat_id: _v418.source_chat_id,
      source_message_id: _v418.source_message_id,
      content_type: _v418.content_type,
      text: _v418.text || "",
      entities: _v418.entities || [],
      file_id: _v418.file_id || null,
      shareable: _v418.shareable,
      sent_count: 0,
      created_at: Date.now(),
    };
  }
  _v421.buttons = _v419;
  await _v19(_v413, _v17(_v420), JSON.stringify(_v421));
  await _v58(_v413, _v416, null, {});

  // Show a real preview: an exact copy of the message with its buttons attached,
  // so the user sees precisely what will be delivered.
  const _v422 = await _v6(_v413, "copyMessage", {
    chat_id: _v414,
    from_chat_id: _v421.source_chat_id,
    message_id: _v421.source_message_id,
    reply_markup: _v419.length ? { inline_keyboard: _v419 } : undefined,
  }).catch(() => null);

  // Reply directly to the preview with just two quick-action buttons — Share
  // and Send without quote — kept separate from the fuller menu below.
  const _v423 = _v422 && _v422.ok ? _v422.result.message_id : null;
  const _v424 = [];
  if (_v421.shareable) _v424.push(_v13(_v5(_v417, "share_btn"), _v420, "primary"));
  _v424.push(_v11(_v5(_v417, "send_now_btn"), `quicksend:${_v420}`, "success"));
  const _v425 = [_v11(_v5(_v417, "schedule_send_btn"), `schedulesend:${_v420}`, "primary")];
  await _v6(_v413, "sendMessage", {
    chat_id: _v414,
    reply_to_message_id: _v423 || undefined,
    text: _v5(_v417, "create_done", { code: _v420 }),
    parse_mode: "HTML",
    reply_markup: _v14(_v424, _v425),
  }).catch(() => {});

  const _v426 = [];
  _v426.push([_v11(_v5(_v417, "btn_stats_code"), `code:stats:${_v420}`), _v11(_v5(_v417, "btn_edit_buttons"), `code:editbtns:${_v420}`)]);
  _v426.push([_v11(_v5(_v417, "btn_delete_code"), `code:del:${_v420}`, "danger")]);
  _v426.push([_v11(_v5(_v417, "btn_back"), "back:menu")]);

  await _v10(_v413, _v414, _v415, {
    parse_mode: "HTML",
    text: _v5(_v417, "create_done", { code: _v420 }),
    reply_markup: _v14(..._v426),
  });
}

// ============================================================
//  Webhook secret
//  Only two variables are required to run this bot: BOT_TOKEN and
//  ADMIN_IDS. Instead of a separate WEBHOOK_SECRET variable, the
//  secret Telegram is told to send back on every webhook call is
//  derived deterministically from BOT_TOKEN itself (SHA-256 hex).
//  Nobody who doesn't already have your bot token can guess it, and
//  you never have to configure or copy it anywhere by hand.
// ============================================================
async function _v73(_v429) {
  const _v430 = new TextEncoder().encode(`${_v429.BOT_TOKEN}:webhook`);
  const _v431 = await crypto.subtle.digest("SHA-256", _v430);
  return [...new Uint8Array(_v431)].map((_v432) => _v432.toString(16).padStart(2, "0")).join("");
}

// Simple gate for the human-facing diagnostic/maintenance endpoints below.
// Since there's no separate setup secret anymore, these just check that the
// caller passes ?admin_id=<one of your ADMIN_IDS> as a query parameter.
function _v74(_v433, _v434) {
  const _v435 = _v434.searchParams.get("admin_id");
  const _v436 = _v435 ? parseInt(_v435, 10) : NaN;
  if (!_v436) return false;
  const _v437 = (_v433.ADMIN_IDS || "")
    .split(",")
    .map((_v438) => parseInt(_v438.trim(), 10))
    .filter((_v439) => _v439);
  return _v437.includes(_v436);
}

// ============================================================
//  HTTP entry point
// ============================================================
export default {
  // Cloudflare Cron Trigger entry point — fires deliverDueSchedules() on
  // whatever schedule you configure (see the README note near the bottom
  // of this file / wrangler.toml `[triggers] crons = [...]`).
  async scheduled(_v440, _v441, _v442) {
    _v442.waitUntil(_v49(_v441));
  },

  async fetch(_v443, _v444, _v445) {
    const _v446 = new URL(_v443.url);

    if (_v446.pathname === "/webhook" && _v443.method === "POST") {
      const _v447 = await _v73(_v444);
      if (_v443.headers.get("X-Telegram-Bot-Api-Secret-Token") !== _v447) {
        return new Response("forbidden", { status: 403 });
      }
      let _v448;
      try {
        _v448 = await _v443.json();
      } catch (_v449) {
        return new Response("bad request", { status: 400 });
      }
      _v445.waitUntil(handleUpdate(_v448, _v444));
      return new Response("ok");
    }

    // Opening the worker's own address in a browser (a plain GET on "/")
    // checks Telegram's current webhook registration and (re)points it at
    // this worker if it isn't already set correctly. No manual /install
    // step and no setup secret needed — just deploy, then open the URL.
    if (_v446.pathname === "/" && _v443.method === "GET") {
      const _v450 = `${_v446.origin}/webhook`;
      let _v451;
      try {
        _v451 = await _v6(_v444, "getWebhookInfo", {});
      } catch (_v454) {
        return new Response(
          JSON.stringify({ ok: false, step: "getWebhookInfo", error: String(_v454) }, null, 2),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!_v451.ok) {
        return new Response(
          JSON.stringify({ ok: false, step: "getWebhookInfo", telegram_response: _v451, hint: "Check that BOT_TOKEN is set correctly." }, null, 2),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      const _v452 = _v451.result.url === _v450;
      let _v453 = null;
      if (!_v452) {
        const _v455 = await _v73(_v444);
        _v453 = await _v6(_v444, "setWebhook", {
          url: _v450,
          secret_token: _v455,
          allowed_updates: ["message", "callback_query", "my_chat_member", "inline_query", "chosen_inline_result"],
          max_connections: 100,
        });
      }
      return new Response(
        JSON.stringify(
          {
            build: _v1,
            webhook_url: _v450,
            already_set: _v452,
            set_result: _v453,
          },
          null,
          2
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (_v446.pathname === "/uninstall") {
      if (!_v74(_v444, _v446)) return new Response("forbidden", { status: 403 });
      const _v456 = await _v6(_v444, "deleteWebhook", {});
      return new Response(JSON.stringify(_v456, null, 2), { headers: { "Content-Type": "application/json" } });
    }

    // Diagnostic: shows exactly what Telegram currently has registered for this
    // bot's webhook (URL, allowed_updates, pending updates, last error).
    // Requires ?admin_id=<one of your ADMIN_IDS>.
    if (_v446.pathname === "/webhookinfo") {
      if (!_v74(_v444, _v446)) return new Response("forbidden", { status: 403 });
      const _v457 = await _v6(_v444, "getWebhookInfo", {});
      return new Response(JSON.stringify(_v457, null, 2), { headers: { "Content-Type": "application/json" } });
    }

    // Manual trigger for scheduled sends — lets you test the feature or
    // deliver due messages without waiting for the Cron Trigger. Safe to
    // call repeatedly; it only delivers records whose send_at has passed.
    // Requires ?admin_id=<one of your ADMIN_IDS>.
    if (_v446.pathname === "/run-schedules") {
      if (!_v74(_v444, _v446)) return new Response("forbidden", { status: 403 });
      await _v49(_v444);
      return new Response("ok");
    }

    // Diagnostic: confirms which build of worker.js is actually live, so you
    // can tell whether a deploy through the dashboard editor actually took.
    if (_v446.pathname === "/version") {
      return new Response(JSON.stringify({ build: _v1 }, null, 2), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(`Bot is running. Build: ${_v1}`);
  },
};
