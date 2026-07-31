import {
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const الأحداث = [
  {
    العنوان: "حدث تاريخي",
    التاريخ: "يُضاف التاريخ بعد التحقق",
    التفاصيل:
      "سيتم إضافة الأحداث التاريخية الموثقة المتعلقة بتاريخ السادة آل باعلوي وتريم في هذا القسم.",
  },
];

export default {
  category: "BaAlwi",

  data: new SlashCommandBuilder()
    .setName("احداث_تاريخية")
    .setDescription(
      "ابحث عن أحداث تاريخية إسلامية موثقة",
    ),

  async execute(interaction) {
    const الحدث =
      الأحداث[
        Math.floor(Math.random() * الأحداث.length)
      ];

    const الرسالة = new EmbedBuilder()
      .setColor(0xc8af69)
      .setTitle(`📜 ${الحدث.العنوان}`)
      .setDescription(الحدث.التفاصيل)
      .addFields({
        name: "التاريخ",
        value: الحدث.التاريخ,
      })
      .setFooter({
        text: "بوت بَاعَلَوي • الأحداث التاريخية",
      });

    await interaction.reply({
      embeds: [الرسالة],
    });
  },
};
