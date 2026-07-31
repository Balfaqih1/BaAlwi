import {
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export default {
  category: "BaAlwi",

  data: new SlashCommandBuilder()
    .setName("التاريخ_الهجري")
    .setDescription(
      "اعرض التاريخ الهجري لليوم",
    ),

  async execute(interaction) {
    const الآن = new Date();

    const التاريخ_الهجري =
      new Intl.DateTimeFormat(
        "ar-SA-u-ca-islamic-umalqura",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Riyadh",
        },
      ).format(الآن);

    const التاريخ_الميلادي =
      new Intl.DateTimeFormat("ar-SA", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Riyadh",
      }).format(الآن);

    const الرسالة = new EmbedBuilder()
      .setColor(0x159d98)
      .setTitle("🌙 التاريخ الهجري")
      .addFields(
        {
          name: "التاريخ الهجري",
          value: التاريخ_الهجري,
        },
        {
          name: "التاريخ الميلادي",
          value: التاريخ_الميلادي,
        },
      )
      .setFooter({
        text:
          "التاريخ محسوب وفق تقويم أم القرى في منطقة الرياض",
      });

    await interaction.reply({
      embeds: [الرسالة],
    });
  },
};
