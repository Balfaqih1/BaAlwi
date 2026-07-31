import {
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const الأذكار = [
  {
    العنوان: "ذكر الصباح",
    النص: "أصبحنا وأصبح الملك لله، والحمد لله.",
    التكرار: "مرة واحدة",
  },
  {
    العنوان: "ذكر الصباح والمساء",
    النص: "سبحان الله وبحمده.",
    التكرار: "مائة مرة",
  },
  {
    العنوان: "ذكر عام",
    النص: "لا حول ولا قوة إلا بالله.",
    التكرار: "ما تيسر",
  },
];

export default {
  category: "BaAlwi",

  data: new SlashCommandBuilder()
    .setName("اذكار")
    .setDescription("تصفّح الأذكار والأدعية المختارة")
    .addStringOption((الخيار) =>
      الخيار
        .setName("النوع")
        .setDescription("اختر نوع العرض")
        .setRequired(false)
        .addChoices(
          {
            name: "ذكر عشوائي",
            value: "عشوائي",
          },
          {
            name: "أذكار الصباح",
            value: "الصباح",
          },
          {
            name: "جميع الأذكار",
            value: "الكل",
          },
        ),
    ),

  async execute(interaction) {
    const النوع =
      interaction.options.getString("النوع") ||
      "عشوائي";

    const الذكر =
      الأذكار[
        Math.floor(Math.random() * الأذكار.length)
      ];

    const الرسالة = new EmbedBuilder()
      .setColor(0x159d98)
      .setAuthor({
        name: "بَاعَلَوي",
      })
      .setTitle(`📿 ${الذكر.العنوان}`)
      .setDescription(
        [
          `**${الذكر.النص}**`,
          "",
          `**التكرار:** ${الذكر.التكرار}`,
          `**نوع العرض:** ${النوع}`,
        ].join("\n"),
      )
      .setFooter({
        text: "بوت بَاعَلَوي • الأذكار",
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [الرسالة],
    });
  },
};
