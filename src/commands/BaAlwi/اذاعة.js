import {
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export default {
  category: "BaAlwi",

  data: new SlashCommandBuilder()
    .setName("اذاعة")
    .setDescription(
      "الوصول إلى الإذاعة والمحتوى الصوتي",
    ),

  async execute(interaction) {
    const الرسالة = new EmbedBuilder()
      .setColor(0x159d98)
      .setTitle("📻 إذاعة بَاعَلَوي")
      .setDescription(
        [
          "سيتم توفير المحتوى الصوتي والإذاعة من خلال هذا القسم.",
          "",
          "لم تتم إضافة رابط إذاعة رسمي حتى الآن.",
          "لن تتم إضافة أي مادة صوتية مملوكة لجهة أخرى من دون إذن.",
        ].join("\n"),
      )
      .setFooter({
        text: "بوت بَاعَلَوي • الإذاعة",
      });

    await interaction.reply({
      embeds: [الرسالة],
    });
  },
};
