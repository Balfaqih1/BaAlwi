import {
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const الأسماء = [
  {
    الاسم: "الرَّحْمَن",
    المعنى:
      "ذو الرحمة الواسعة التي شملت جميع الخلق.",
  },
  {
    الاسم: "الرَّحِيم",
    المعنى:
      "كثير الرحمة بعباده.",
  },
  {
    الاسم: "المَلِك",
    المعنى:
      "المالك لجميع المخلوقات والمتصرف فيها.",
  },
  {
    الاسم: "السَّلَام",
    المعنى:
      "السالم من كل نقص وعيب.",
  },
  {
    الاسم: "الحَكِيم",
    المعنى:
      "الذي يضع الأشياء في مواضعها بحكمة.",
  },
];

export default {
  category: "BaAlwi",

  data: new SlashCommandBuilder()
    .setName("اسماء_الله_الحسنى")
    .setDescription(
      "تعرّف على أسماء الله الحسنى ومعانيها",
    ),

  async execute(interaction) {
    const العنصر =
      الأسماء[
        Math.floor(Math.random() * الأسماء.length)
      ];

    const الرسالة = new EmbedBuilder()
      .setColor(0xc8af69)
      .setTitle(`✨ ${العنصر.الاسم}`)
      .setDescription(`**المعنى:** ${العنصر.المعنى}`)
      .setFooter({
        text: "بوت بَاعَلَوي • أسماء الله الحسنى",
      });

    await interaction.reply({
      embeds: [الرسالة],
    });
  },
};
