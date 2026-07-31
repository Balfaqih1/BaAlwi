import {
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const الأسماء = [
  {
    الاسم: "مُحَمَّد ﷺ",
    البيان:
      "اسم النبي محمد بن عبد الله ﷺ.",
  },
  {
    الاسم: "أَحْمَد ﷺ",
    البيان:
      "من أسماء النبي ﷺ الواردة في القرآن الكريم.",
  },
  {
    الاسم: "المَاحِي ﷺ",
    البيان:
      "الذي يمحو الله به الكفر.",
  },
  {
    الاسم: "الحَاشِر ﷺ",
    البيان:
      "الذي يُحشر الناس على أثره.",
  },
  {
    الاسم: "العَاقِب ﷺ",
    البيان:
      "الذي ليس بعده نبي.",
  },
];

export default {
  category: "BaAlwi",

  data: new SlashCommandBuilder()
    .setName("اسماء_النبي")
    .setDescription(
      "تعرّف على أسماء النبي محمد ﷺ",
    ),

  async execute(interaction) {
    const العنصر =
      الأسماء[
        Math.floor(Math.random() * الأسماء.length)
      ];

    const الرسالة = new EmbedBuilder()
      .setColor(0x159d98)
      .setTitle(`ﷺ ${العنصر.الاسم}`)
      .setDescription(العنصر.البيان)
      .setFooter({
        text: "اللهم صل وسلم وبارك على سيدنا محمد",
      });

    await interaction.reply({
      embeds: [الرسالة],
    });
  },
};
