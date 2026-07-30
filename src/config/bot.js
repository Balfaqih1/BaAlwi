import { logger } from "../utils/logger.js";

/**
 * BaAlwi Bot configuration
 *
 * This file contains only the general configuration required by the
 * BaAlwi project. Old Titan systems are disabled but some compatibility
 * properties and exported helper functions remain to prevent old imports
 * from crashing while the project is being migrated.
 */

export const botConfig = {
  // ==================================================
  // BOT IDENTITY
  // ==================================================
  identity: {
    name: "باعلوي",
    englishName: "BaAlwi",

    description:
      "بوت بَاعَلَوي يقدّم محتوى متعلقًا بتراث السادة آل باعلوي، ويضم الأذكار، والأوراد، والقصائد، والمحتوى الإسلامي في مكانٍ واحد؛ لتسهيل الوصول إليها داخل ديسكورد.",

    version: process.env.BOT_VERSION || "1.0.0",

    website: process.env.BOT_WEBSITE || null,

    supportServer: process.env.SUPPORT_SERVER_URL || null,

    /**
     * Keep this false unless you have official permission to present
     * the bot as an official BaAlwi application.
     */
    official: process.env.BAALWI_OFFICIAL === "true",
  },

  // ==================================================
  // BOT PRESENCE
  // ==================================================
  presence: {
    /**
     * Allowed values:
     * online
     * idle
     * dnd
     * invisible
     */
    status: "online",

    activities: [
      {
        /**
         * Discord activity types:
         * 0 = Playing
         * 1 = Streaming
         * 2 = Listening
         * 3 = Watching
         * 4 = Custom
         * 5 = Competing
         */
        name: "باعلوي",
        state: "الأذكار والأوراد والقصائد",
        type: 4,
      },
    ],
  },

  // ==================================================
  // COMMAND SETTINGS
  // ==================================================
  commands: {
    /**
     * OWNER_IDS example:
     * OWNER_IDS=123456789012345678,987654321098765432
     */
    owners:
      process.env.OWNER_IDS
        ?.split(",")
        .map((id) => id.trim())
        .filter(Boolean) || [],

    prefix: process.env.PREFIX || "!",

    defaultCooldown: Number.parseInt(
      process.env.DEFAULT_COMMAND_COOLDOWN || "3",
      10,
    ),

    deleteCommands: process.env.DELETE_COMMANDS === "true",

    testGuildId:
      process.env.TEST_GUILD_ID ||
      process.env.GUILD_ID ||
      null,

    maintenanceMode: process.env.MAINTENANCE_MODE === "true",
  },

  // ==================================================
  // BAALWI CONTENT
  // ==================================================
  content: {
    defaultLanguage: process.env.DEFAULT_LANGUAGE || "ar",

    supportedLanguages: ["ar"],

    defaultPageSize: Number.parseInt(
      process.env.CONTENT_PAGE_SIZE || "5",
      10,
    ),

    maximumPageSize: 10,

    randomCooldown: 3,

    categories: {
      adhkar: {
        enabled: true,
        label: "الأذكار",
        emoji: "📿",
      },

      awrad: {
        enabled: true,
        label: "الأوراد",
        emoji: "🤲",
      },

      qasaid: {
        enabled: true,
        label: "القصائد",
        emoji: "📜",
      },

      mawalid: {
        enabled: true,
        label: "الموالد",
        emoji: "🌙",
      },

      hadrat: {
        enabled: true,
        label: "الحضرات",
        emoji: "🕌",
      },

      duas: {
        enabled: true,
        label: "الأدعية",
        emoji: "🤍",
      },
    },

    /**
     * Show the source of each item whenever possible.
     */
    showSource: true,

    showAuthor: true,

    allowBookmarks: true,

    allowSearch: true,

    allowRandomContent: true,
  },

  // ==================================================
  // PRAYER TIMES
  // ==================================================
  prayerTimes: {
    enabled: true,

    defaultCountry: process.env.DEFAULT_COUNTRY || "Saudi Arabia",

    defaultCity: process.env.DEFAULT_CITY || "Jeddah",

    defaultTimezone:
      process.env.DEFAULT_TIMEZONE || "Asia/Riyadh",

    /**
     * Calculation method should be handled by the prayer-time service.
     */
    calculationMethod:
      process.env.PRAYER_CALCULATION_METHOD || "UmmAlQura",

    sendTextNotification: true,

    sendBeforePrayerNotification:
      process.env.PRAYER_EARLY_NOTIFICATION === "true",

    notifyBeforeMinutes: Number.parseInt(
      process.env.PRAYER_NOTIFY_BEFORE_MINUTES || "10",
      10,
    ),

    prayers: {
      fajr: {
        enabled: true,
        label: "الفجر",
      },

      sunrise: {
        enabled: false,
        label: "الشروق",
      },

      dhuhr: {
        enabled: true,
        label: "الظهر",
      },

      asr: {
        enabled: true,
        label: "العصر",
      },

      maghrib: {
        enabled: true,
        label: "المغرب",
      },

      isha: {
        enabled: true,
        label: "العشاء",
      },
    },
  },

  // ==================================================
  // ADHAN VOICE SYSTEM
  // ==================================================
  adhan: {
    enabled: true,

    /**
     * The bot joins the configured voice channel, plays the adhan,
     * and disconnects when playback finishes.
     */
    joinVoiceChannel: true,

    leaveAfterPlayback: true,

    disconnectDelayMs: Number.parseInt(
      process.env.ADHAN_DISCONNECT_DELAY_MS || "3000",
      10,
    ),

    connectionTimeoutMs: Number.parseInt(
      process.env.ADHAN_CONNECTION_TIMEOUT_MS || "20000",
      10,
    ),

    /**
     * Local paths or remote URLs may be configured later.
     */
    defaultAudio:
      process.env.ADHAN_AUDIO_URL ||
      "./assets/audio/adhan.mp3",

    fajrAudio:
      process.env.FAJR_ADHAN_AUDIO_URL ||
      "./assets/audio/fajr-adhan.mp3",

    volume: Number.parseFloat(
      process.env.ADHAN_VOLUME || "0.8",
    ),

    /**
     * Prevent duplicate playback if the scheduler runs more than once.
     */
    duplicateProtectionMinutes: Number.parseInt(
      process.env.ADHAN_DUPLICATE_PROTECTION_MINUTES || "10",
      10,
    ),

    /**
     * Do not interrupt another active audio session by default.
     */
    interruptExistingAudio: false,
  },

  // ==================================================
  // REMINDERS
  // ==================================================
  reminders: {
    enabled: true,

    dailyAdhkar: true,

    morningAdhkar: true,

    eveningAdhkar: true,

    fridayReminder: true,

    specialOccasions: true,

    defaultTimezone:
      process.env.DEFAULT_TIMEZONE || "Asia/Riyadh",
  },

  // ==================================================
  // EMBED BRANDING
  // ==================================================
  embeds: {
    colors: {
      primary: "#159D98",
      secondary: "#C8AF69",

      success: "#57F287",
      error: "#ED4245",
      warning: "#FEE75C",
      info: "#159D98",

      light: "#FFFFFF",
      dark: "#17191C",
      gray: "#A8A8A8",

      /**
       * Compatibility colors retained for utilities that may still
       * request old color keys.
       */
      blurple: "#5865F2",
      green: "#57F287",
      yellow: "#FEE75C",
      fuchsia: "#EB459E",
      red: "#ED4245",
      black: "#000000",

      prayer: "#C8AF69",
      adhkar: "#159D98",
      awrad: "#148C87",
      qasaid: "#B99A4F",
      mawalid: "#D0B86C",
      hadrat: "#117B77",

      /**
       * Compatibility objects for old Titan utilities.
       * Their related features remain disabled.
       */
      giveaway: {
        active: "#57F287",
        ended: "#ED4245",
      },

      ticket: {
        open: "#57F287",
        claimed: "#FAA61A",
        closed: "#ED4245",
        pending: "#99AAB5",
      },

      priority: {
        none: "#95A5A6",
        low: "#3498DB",
        medium: "#2ECC71",
        high: "#F1C40F",
        urgent: "#E74C3C",
      },

      economy: "#F1C40F",
      birthday: "#E91E63",
      moderation: "#9B59B6",
    },

    footer: {
      text: "بوت باعلوي",
      icon: process.env.BOT_ICON_URL || null,
    },

    thumbnail: process.env.BOT_ICON_URL || null,

    author: {
      name: "باعلوي",
      icon: process.env.BOT_ICON_URL || null,
      url: process.env.BOT_WEBSITE || null,
    },
  },

  // ==================================================
  // GENERIC ARABIC MESSAGES
  // ==================================================
  messages: {
    noPermission: "ليس لديك إذن لاستخدام هذا الأمر.",

    ownerOnly: "هذا الأمر متاح لمالك البوت فقط.",

    adminOnly:
      "هذا الأمر متاح لإدارة السيرفر فقط.",

    cooldownActive:
      "يرجى الانتظار {time} قبل استخدام الأمر مرة أخرى.",

    errorOccurred:
      "حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة مرة أخرى.",

    missingPermissions:
      "لا أمتلك الصلاحيات المطلوبة لتنفيذ هذا الإجراء.",

    commandDisabled:
      "هذا الأمر غير مفعّل حاليًا.",

    maintenanceMode:
      "البوت تحت الصيانة حاليًا. يرجى المحاولة لاحقًا.",

    contentNotFound:
      "لم يتم العثور على محتوى مطابق.",

    noResults:
      "لا توجد نتائج مطابقة لبحثك.",

    invalidPage:
      "رقم الصفحة غير صحيح.",

    guildOnly:
      "يمكن استخدام هذا الأمر داخل السيرفر فقط.",

    voiceChannelRequired:
      "يجب أن تدخل قناة صوتية أولًا.",

    adhanChannelNotConfigured:
      "لم يتم تحديد قناة صوتية للأذان في هذا السيرفر.",

    prayerLocationNotConfigured:
      "لم يتم تحديد المدينة أو الموقع الخاص بمواقيت الصلاة.",

    databaseUnavailable:
      "قاعدة البيانات غير متاحة حاليًا. يرجى المحاولة لاحقًا.",
  },

  // ==================================================
  // FEATURE TOGGLES
  // ==================================================
  features: {
    /**
     * Core BaAlwi systems
     */
    baalawiContent: true,
    adhkar: true,
    awrad: true,
    qasaid: true,
    mawalid: true,
    hadrat: true,
    duas: true,

    prayerTimes: true,
    adhan: true,
    reminders: true,

    search: true,
    bookmarks: true,
    utility: true,
    voice: true,
    logging: true,

    /**
     * Old Titan systems disabled.
     */
    economy: false,
    leveling: false,
    moderation: false,
    welcome: false,
    tickets: false,
    giveaways: false,
    birthday: false,
    counter: false,
    verification: false,
    reactionRoles: false,
    joinToCreate: false,
    tools: false,
    community: false,
    fun: false,
    music: false,
  },

  // ==================================================
  // COMPATIBILITY CONFIGURATION
  // ==================================================
  /**
   * These minimal objects prevent older Titan modules from crashing
   * while you remove their files gradually.
   */

  applications: {
    defaultQuestions: [],
    statusColors: {
      pending: "#FEE75C",
      approved: "#57F287",
      denied: "#ED4245",
    },
    applicationCooldown: 24,
    deleteDeniedAfter: 7,
    deleteApprovedAfter: 30,
    managerRoles: [],
  },

  economy: {
    currency: {
      name: "points",
      namePlural: "points",
      symbol: "",
    },
    startingBalance: 0,
    baseBankCapacity: 0,
    dailyAmount: 0,
    workMin: 0,
    workMax: 0,
    begMin: 0,
    begMax: 0,
    cooldowns: {
      daily: 0,
      work: 0,
      crime: 0,
      rob: 0,
    },
    robSuccessRate: 0,
    robFailJailTime: 0,
  },

  shop: {},

  tickets: {
    defaultCategory: null,
    supportRoles: [],
    priorities: {},
    defaultPriority: "none",
    archiveCategory: null,
    logChannel: null,
  },

  giveaways: {
    defaultDuration: 86_400_000,
    minimumWinners: 1,
    maximumWinners: 1,
    minimumDuration: 300_000,
    maximumDuration: 2_592_000_000,
    allowedRoles: [],
    bypassRoles: [],
  },

  birthday: {
    defaultRole: null,
    announcementChannel: null,
    timezone:
      process.env.DEFAULT_TIMEZONE || "Asia/Riyadh",
  },

  verification: {
    defaultMessage: "",
    defaultButtonText: "",
    autoVerify: {
      defaultCriteria: "none",
      defaultAccountAgeDays: 7,
      serverSizeThreshold: 1000,
      minAccountAge: 1,
      maxAccountAge: 365,
      sendDMNotification: false,
      criteria: {
        account_age: "",
        server_size: "",
        none: "",
      },
    },
    verificationCooldown: 5000,
    maxVerificationAttempts: 3,
    attemptWindow: 60_000,
    maxCooldownEntries: 1000,
    maxAttemptEntries: 1000,
    cooldownCleanupInterval: 300_000,
    maxAuditMetadataBytes: 4096,
    maxInMemoryAuditEntries: 100,
    logAllVerifications: false,
    keepAuditTrail: false,
  },

  welcome: {
    defaultWelcomeMessage: "",
    defaultGoodbyeMessage: "",
    defaultWelcomeChannel: null,
    defaultGoodbyeChannel: null,
  },

  counters: {
    defaults: {
      name: "{name} Counter",
      description: "",
      type: "voice",
      channelName: "{name}-{count}",
    },
    permissions: {
      deny: [],
      allow: [],
    },
    messages: {
      created: "",
      deleted: "",
      updated: "",
    },
    types: {},
  },
};

// ==================================================
// CONFIGURATION VALIDATION
// ==================================================

export function validateConfig(config = botConfig) {
  const errors = [];

  const token =
    process.env.DISCORD_TOKEN ||
    process.env.TOKEN;

  if (!token) {
    errors.push(
      "Bot token is required. Set DISCORD_TOKEN or TOKEN.",
    );
  }

  if (!process.env.CLIENT_ID) {
    errors.push(
      "Discord application ID is required. Set CLIENT_ID.",
    );
  }

  if (
    config.commands.defaultCooldown < 0 ||
    Number.isNaN(config.commands.defaultCooldown)
  ) {
    errors.push(
      "DEFAULT_COMMAND_COOLDOWN must be a valid positive number.",
    );
  }

  if (
    config.adhan.volume < 0 ||
    config.adhan.volume > 1 ||
    Number.isNaN(config.adhan.volume)
  ) {
    errors.push(
      "ADHAN_VOLUME must be a number between 0 and 1.",
    );
  }

  if (
    config.prayerTimes.notifyBeforeMinutes < 0 ||
    Number.isNaN(config.prayerTimes.notifyBeforeMinutes)
  ) {
    errors.push(
      "PRAYER_NOTIFY_BEFORE_MINUTES must be a valid positive number.",
    );
  }

  if (process.env.NODE_ENV === "production") {
    const hasConnectionUrl = Boolean(
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL,
    );

    const hasSeparatePostgresVariables = Boolean(
      process.env.POSTGRES_HOST &&
      process.env.POSTGRES_USER &&
      process.env.POSTGRES_PASSWORD &&
      process.env.POSTGRES_DB,
    );

    if (
      !hasConnectionUrl &&
      !hasSeparatePostgresVariables
    ) {
      errors.push(
        "PostgreSQL connection is required in production. Set DATABASE_URL/POSTGRES_URL or the separate POSTGRES_* variables.",
      );
    }
  }

  if (process.env.NODE_ENV !== "production") {
    logger.debug("BaAlwi environment check:");
    logger.debug(
      "DISCORD_TOKEN exists:",
      Boolean(token),
    );
    logger.debug(
      "CLIENT_ID exists:",
      Boolean(process.env.CLIENT_ID),
    );
    logger.debug(
      "GUILD_ID exists:",
      Boolean(process.env.GUILD_ID),
    );
    logger.debug(
      "DATABASE_URL exists:",
      Boolean(
        process.env.DATABASE_URL ||
        process.env.POSTGRES_URL,
      ),
    );
    logger.debug(
      "NODE_ENV:",
      process.env.NODE_ENV || "development",
    );
  }

  return errors;
}

const configErrors = validateConfig(botConfig);

if (configErrors.length > 0) {
  logger.error(
    "BaAlwi bot configuration errors:\n" +
      configErrors.join("\n"),
  );

  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

// Compatibility export used by some Titan files.
export const BotConfig = botConfig;

// ==================================================
// COMMAND CATEGORY FEATURE MAP
// ==================================================

const COMMAND_CATEGORY_FEATURE_MAP = {
  core: null,

  adhkar: "adhkar",
  azkar: "adhkar",

  awrad: "awrad",
  wird: "awrad",

  qasaid: "qasaid",
  poems: "qasaid",

  mawalid: "mawalid",
  mawlid: "mawalid",

  hadrat: "hadrat",
  hadra: "hadrat",

  duas: "duas",
  dua: "duas",

  prayer: "prayerTimes",
  prayers: "prayerTimes",
  prayertimes: "prayerTimes",
  prayer_times: "prayerTimes",

  adhan: "adhan",
  reminders: "reminders",

  bookmark: "bookmarks",
  bookmarks: "bookmarks",

  search: "search",
  utility: "utility",
  voice: "voice",
  logging: "logging",

  /**
   * Old Titan category mappings are retained so the loader can
   * recognize them and disable their commands through feature flags.
   */
  birthday: "birthday",
  community: "community",
  economy: "economy",
  fun: "fun",
  giveaway: "giveaways",
  giveaways: "giveaways",
  jointocreate: "joinToCreate",
  join_to_create: "joinToCreate",
  leveling: "leveling",
  moderation: "moderation",
  music: "music",
  reaction_roles: "reactionRoles",
  serverstats: "counter",
  counter: "counter",
  ticket: "tickets",
  tickets: "tickets",
  tools: "tools",
  verification: "verification",
  welcome: "welcome",
};

// ==================================================
// HELPER FUNCTIONS
// ==================================================

function normalizeCategoryKey(category) {
  return String(category || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function getCommandPrefix() {
  return botConfig.commands?.prefix || "!";
}

export function getBotOwners() {
  return (botConfig.commands?.owners || [])
    .map((id) => String(id).trim())
    .filter(Boolean);
}

export function isBotOwner(userId) {
  if (!userId) {
    return false;
  }

  return getBotOwners().includes(
    String(userId),
  );
}

export function isMaintenanceMode() {
  return (
    botConfig.commands?.maintenanceMode === true
  );
}

export function getBotMessage(
  key,
  replacements = {},
) {
  let message =
    botConfig.messages?.[key] || key;

  for (const [placeholder, value] of Object.entries(
    replacements,
  )) {
    message = message.replace(
      new RegExp(`\\{${placeholder}\\}`, "g"),
      String(value),
    );
  }

  return message;
}

export function isFeatureEnabled(featureKey) {
  if (!featureKey) {
    return true;
  }

  return (
    botConfig.features?.[featureKey] !== false
  );
}

export function isCommandCategoryEnabled(category) {
  const normalized =
    normalizeCategoryKey(category);

  if (!normalized || normalized === "core") {
    return true;
  }

  const featureKey =
    COMMAND_CATEGORY_FEATURE_MAP[normalized];

  /**
   * Unknown categories remain enabled so new BaAlwi command
   * categories do not silently disappear.
   */
  if (!featureKey) {
    return true;
  }

  return isFeatureEnabled(featureKey);
}

export function getContentCategory(categoryKey) {
  const normalized =
    normalizeCategoryKey(categoryKey);

  return (
    botConfig.content?.categories?.[normalized] ||
    null
  );
}

export function isContentCategoryEnabled(
  categoryKey,
) {
  const category =
    getContentCategory(categoryKey);

  return category?.enabled === true;
}

export function getPrayerConfig(prayerName) {
  const normalized =
    normalizeCategoryKey(prayerName);

  return (
    botConfig.prayerTimes?.prayers?.[
      normalized
    ] || null
  );
}

export function isPrayerEnabled(prayerName) {
  return (
    getPrayerConfig(prayerName)?.enabled ===
    true
  );
}

/**
 * Compatibility helper retained for any old modules that import it.
 */
export function getApplicationStatusColor(
  status,
) {
  const colors =
    botConfig.applications?.statusColors || {};

  const hex = colors[status];

  if (hex) {
    return getColor(hex);
  }

  if (status === "approved") {
    return getColor("success");
  }

  if (status === "denied") {
    return getColor("error");
  }

  return getColor("warning");
}

/**
 * Compatibility helper retained for old Titan modules.
 */
export function getDefaultApplicationQuestions() {
  return (
    botConfig.applications
      ?.defaultQuestions || []
  )
    .map((entry) =>
      typeof entry === "string"
        ? entry
        : entry?.question,
    )
    .filter(Boolean);
}

export function getColor(
  path,
  fallback = "#A8A8A8",
) {
  if (typeof path === "number") {
    return path;
  }

  if (
    typeof path === "string" &&
    path.startsWith("#")
  ) {
    return Number.parseInt(
      path.slice(1),
      16,
    );
  }

  if (typeof path !== "string") {
    return Number.parseInt(
      fallback.slice(1),
      16,
    );
  }

  const result = path
    .split(".")
    .reduce(
      (current, key) =>
        current &&
        current[key] !== undefined
          ? current[key]
          : undefined,
      botConfig.embeds.colors,
    );

  if (
    typeof result === "string" &&
    result.startsWith("#")
  ) {
    return Number.parseInt(
      result.slice(1),
      16,
    );
  }

  if (typeof result === "number") {
    return result;
  }

  return Number.parseInt(
    fallback.replace("#", ""),
    16,
  );
}

export function getRandomColor() {
  const colors = [];

  function collectColors(value) {
    if (
      typeof value === "string" &&
      value.startsWith("#")
    ) {
      colors.push(value);
      return;
    }

    if (
      value &&
      typeof value === "object"
    ) {
      for (const nestedValue of Object.values(
        value,
      )) {
        collectColors(nestedValue);
      }
    }
  }

  collectColors(botConfig.embeds.colors);

  if (colors.length === 0) {
    return getColor("primary");
  }

  const selected =
    colors[
      Math.floor(
        Math.random() * colors.length,
      )
    ];

  return getColor(selected);
}

export default botConfig;
