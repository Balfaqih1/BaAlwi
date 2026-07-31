import {
  SlashCommandBuilder,
} from "discord.js";

import {
  getVoiceConnection,
} from "@discordjs/voice";

export default {
  category: "Voice",

  data: new SlashCommandBuilder()
    .setName("غادر")
    .setDescription("يجعل بوت باعلوي يغادر القناة الصوتية"),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "يمكن استخدام هذا الأمر داخل السيرفر فقط.",
        ephemeral: true,
      });

      return;
    }

    const connection =
      getVoiceConnection(interaction.guild.id);

    if (!connection) {
      await interaction.reply({
        content:
          "بوت باعلوي غير موجود في قناة صوتية حاليًا.",
        ephemeral: true,
      });

      return;
    }

    connection.destroy();

    await interaction.reply({
      content:
        "تمت مغادرة القناة الصوتية بنجاح.",
      ephemeral: true,
    });
  },
};
