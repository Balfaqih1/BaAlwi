import {
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const الأدعية = [
  {
    العنوان: "دعاء جامع",
    النص:
      "اللهم آتنا في الدنيا حسنة، وفي الآخرة حسنة، وقنا عذاب النار.",
  },
  {
    العنوان: "دعاء التيسير",
    النص:
      "اللهم لا سهل إلا ما جعلته سهلًا، وأنت تجعل الحزن إذا شئت سهلًا.",
  },
  {
    العنوان: "دعاء طلب العلم",
    النص:
      "رب زدني علمًا، وارزقني فهمًا وحكمة.",
  },
];

export default {
  category: "BaAlwi",

  data: new SlashCommandBuilder()
    .setName("ادعية")
    .setDescription("تصفّح الأدعية المختارة"),

  async execute(interaction) {
    const الدعاء =
      الأدعية[
        Math.floor(Math.random() * الأدعية.length)
      ];

    const الرسالة = new EmbedBuilder()
      .setColor(0x159d98)
      .setTitle(`🤲 ${الدعاء.العنوان}`)
      .setDescription(`**${الدعاء.النص}**`)
      .setFooter({
        text: "بوت بَاعَلَوي • الأدعية",
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [الرسالة],
    });
  },
};
