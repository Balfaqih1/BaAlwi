import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  REST,
  Routes,
} from "discord.js";

const token =
  process.env.DISCORD_TOKEN ||
  process.env.TOKEN;

const clientId =
  process.env.CLIENT_ID;

const guildId =
  process.env.GUILD_ID;

if (!token) {
  throw new Error(
    "DISCORD_TOKEN أو TOKEN غير موجود.",
  );
}

if (!clientId) {
  throw new Error(
    "CLIENT_ID غير موجود.",
  );
}

/**
 * مهم:
 * غيّر BaAlWi هنا إذا كان اسم مجلدك مختلفًا.
 *
 * المسار المتوقع:
 * src/commands/BaAlWi
 */
const commandsDirectory =
  path.resolve(
    "src",
    "commands",
    "BaAlWi",
  );

if (!fs.existsSync(commandsDirectory)) {
  throw new Error(
    `مجلد أوامر باعلوي غير موجود:\n${commandsDirectory}`,
  );
}

const commands = [];
const commandNames = new Set();

async function loadCommands(directory) {
  const entries = fs.readdirSync(
    directory,
    {
      withFileTypes: true,
    },
  );

  for (const entry of entries) {
    const fullPath =
      path.join(
        directory,
        entry.name,
      );

    if (entry.isDirectory()) {
      await loadCommands(fullPath);
      continue;
    }

    if (
      !entry.isFile() ||
      !entry.name.endsWith(".js")
    ) {
      continue;
    }

    try {
      const moduleUrl =
        pathToFileURL(fullPath).href;

      const commandModule =
        await import(moduleUrl);

      const command =
        commandModule.default;

      if (!command?.data) {
        console.warn(
          `تم تجاهل الملف؛ لا يحتوي على command.data:\n${fullPath}`,
        );

        continue;
      }

      const commandJson =
        typeof command.data.toJSON ===
        "function"
          ? command.data.toJSON()
          : command.data;

      if (!commandJson?.name) {
        console.warn(
          `تم تجاهل أمر بلا اسم:\n${fullPath}`,
        );

        continue;
      }

      if (
        commandNames.has(
          commandJson.name,
        )
      ) {
        throw new Error(
          `يوجد أمر مكرر باسم /${commandJson.name}`,
        );
      }

      commandNames.add(
        commandJson.name,
      );

      commands.push(
        commandJson,
      );

      console.log(
        `✅ تم تحميل الأمر: /${commandJson.name}`,
      );
    } catch (error) {
      console.error(
        `❌ فشل تحميل الملف:\n${fullPath}`,
      );

      console.error(error);
    }
  }
}

await loadCommands(
  commandsDirectory,
);

if (commands.length === 0) {
  throw new Error(
    "لم يتم العثور على أي أوامر صالحة داخل مجلد BaAlWi.",
  );
}

console.log("");
console.log(
  `سيتم تسجيل ${commands.length} أمرًا فقط:`,
);

for (const command of commands) {
  console.log(
    `- /${command.name}`,
  );
}

const rest = new REST({
  version: "10",
}).setToken(token);

/**
 * التسجيل العالمي:
 * يستبدل جميع أوامر البوت العالمية بقائمة أوامر باعلوي فقط.
 */
console.log("");
console.log(
  "جاري استبدال الأوامر العالمية القديمة...",
);

const globalResult =
  await rest.put(
    Routes.applicationCommands(
      clientId,
    ),
    {
      body: commands,
    },
  );

console.log(
  `✅ تم تسجيل ${globalResult.length} أمرًا عالميًا.`,
);

/**
 * إذا كان GUILD_ID موجودًا، نسجل الأوامر داخل سيرفر الاختبار أيضًا.
 * أوامر السيرفر عادة تظهر أسرع أثناء التطوير.
 */
if (guildId) {
  console.log("");
  console.log(
    "جاري تسجيل أوامر سيرفر الاختبار...",
  );

  const guildResult =
    await rest.put(
      Routes.applicationGuildCommands(
        clientId,
        guildId,
      ),
      {
        body: commands,
      },
    );

  console.log(
    `✅ تم تسجيل ${guildResult.length} أمرًا في سيرفر الاختبار.`,
  );
}

console.log("");
console.log(
  "اكتمل تسجيل أوامر باعلوي وحذف الأوامر القديمة من قائمة Discord.",
);
