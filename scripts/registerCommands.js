import "dotenv/config";
import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const token =
  process.env.DISCORD_TOKEN ||
  process.env.TOKEN;

const clientId =
  process.env.CLIENT_ID;

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

const commandsDirectory =
  path.resolve("src/commands");

const commands = [];

async function loadCommands(directory) {
  const entries = fs.readdirSync(
    directory,
    {
      withFileTypes: true,
    },
  );

  for (const entry of entries) {
    const fullPath = path.join(
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
          `تم تجاهل الملف لأنه لا يحتوي على command.data: ${fullPath}`,
        );
        continue;
      }

      const json =
        typeof command.data.toJSON === "function"
          ? command.data.toJSON()
          : command.data;

      commands.push(json);

      console.log(
        `تم تحميل الأمر: /${json.name}`,
      );
    } catch (error) {
      console.error(
        `فشل تحميل الأمر من ${fullPath}:`,
        error,
      );
    }
  }
}

await loadCommands(commandsDirectory);

console.log(
  `سيتم تسجيل ${commands.length} أمرًا.`,
);

const rest = new REST({
  version: "10",
}).setToken(token);

/**
 * هذا الاستدعاء يستبدل قائمة الأوامر العالمية كاملة.
 * أي أمر قديم غير موجود في commands سيتم حذفه من Discord.
 */
const registeredCommands =
  await rest.put(
    Routes.applicationCommands(clientId),
    {
      body: commands,
    },
  );

console.log(
  `تم تسجيل ${registeredCommands.length} أمرًا عالميًا بنجاح.`,
);
