import {
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const الموضوعات = {
  الحج: {
    العنوان: "الحج",
    النص:
      "الحج عبادة عظيمة، ويجب تعلّم أحكامه من المصادر الموثوقة وأهل العلم قبل أداء المناسك.",
  },

  العمرة: {
    العنوان: "العمرة",
    النص:
      "تتضمن العمرة الإحرام والطواف والسعي والحلق أو التقصير، مع مراعاة الأحكام الشرعية.",
  },

  الاحرام: {
    العنوان: "الإحرام",
    النص:
      "الإحرام نية الدخول في النسك، وله مواقيت وأحكام ومحظورات ينبغي معرفتها.",
  },
};

export default {
  category: "BaAlwi",

  data: new SlashCommandBuilder()
    .setName("الحج_والعمرة")
    .setDescription(
      "تصفّح معلومات الحج والعمرة",
    )
    .addStringOption((الخيار) =>
      الخيار
        .setName("الموضوع")
        .setDescription(
          "اختر الموضوع الذي تريد قراءته",
        )
        .setRequired(true)
        .addChoices(
          {
            name: "الحج",
            value: "الحج",
          },
          {
            name: "العمرة",
            value: "العمرة",
          },
          {
            name: "الإحرام",
            value: "الاحرام",
          },
        ),
    ),

  async execute(interaction) {
    const الاختيار =
      interaction.options.getString(
        "الموضوع",
        true,
      );

    const الموضوع =
      الموضوعات[الاختيار];

    const الرسالة = new EmbedBuilder()
      .setColor(0xc8af69)
      .setTitle(`🕋 ${الموضوع.العنوان}`)
      .setDescription(
        [
          الموضوع.النص,
          "",
          "هذه معلومات تمهيدية وليست فتوى شرعية.",
        ].join("\n"),
      )
      .setFooter({
        text: "بوت بَاعَلَوي • الحج والعمرة",
      });

    await interaction.reply({
      embeds: [الرسالة],
    });
  },
};
