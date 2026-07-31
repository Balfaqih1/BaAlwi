import {
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export default {
  category: "BaAlwi",

  data: new SlashCommandBuilder()
    .setName("الاذان")
    .setDescription(
      "معلومات عن الأذان ومواقيت الصلاة",
    )
    .addStringOption((الخيار) =>
      الخيار
        .setName("المدينة")
        .setDescription(
          "اكتب اسم المدينة",
        )
        .setRequired(false),
    ),

  async execute(interaction) {
    const المدينة =
      interaction.options.getString("المدينة") ||
      "لم تُحدد";

    const الرسالة = new EmbedBuilder()
      .setColor(0xc8af69)
      .setTitle("🕌 الأذان ومواقيت الصلاة")
      .setDescription(
        [
          `**المدينة:** ${المدينة}`,
          "",
          "خدمة حساب مواقيت الصلاة لم يتم ربطها بعد.",
          "سيتم لاحقًا عرض المواقيت بحسب المدينة والمنطقة الزمنية.",
          "",
          "الأذان الصوتي غير مفعّل.",
        ].join("\n"),
      )
      .setFooter({
        text: "بوت بَاعَلَوي • مواقيت الصلاة",
      });

    await interaction.reply({
      embeds: [الرسالة],
    });
  },
};
