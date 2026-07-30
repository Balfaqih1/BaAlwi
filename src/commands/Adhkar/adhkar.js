import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

import {
  adhkar,
  getAdhkarByCategory,
} from "../../data/adhkar.js";

const BRAND_COLOR = 0x159d98;

function createAdhkarEmbed(item, index, total) {
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setAuthor({
      name: "باعلوي",
    })
    .setTitle(item.title)
    .setDescription(
      [
        item.text,
        "",
        `**عدد المرات:** ${item.count}`,
        `**المصدر:** ${item.source}`,
      ].join("\n"),
    )
    .setFooter({
      text: `بوت باعلوي • ${index + 1} من ${total}`,
    });
}

function createNavigationRow(
  userId,
  category,
  index,
  total,
) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(
        `adhkar:previous:${userId}:${category}:${index}`,
      )
      .setLabel("السابق")
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(total <= 1),

    new ButtonBuilder()
      .setCustomId(
        `adhkar:random:${userId}:${category}:${index}`,
      )
      .setLabel("عشوائي")
      .setEmoji("🔀")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(total <= 1),

    new ButtonBuilder()
      .setCustomId(
        `adhkar:next:${userId}:${category}:${index}`,
      )
      .setLabel("التالي")
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(total <= 1),
  );
}

export default {
  category: "Adhkar",

  data: new SlashCommandBuilder()
    .setName("اذكار")
    .setDescription("عرض الأذكار")
    .addStringOption((option) =>
      option
        .setName("التصنيف")
        .setDescription("اختر تصنيف الأذكار")
        .setRequired(false)
        .addChoices(
          {
            name: "جميع الأذكار",
            value: "all",
          },
          {
            name: "أذكار الصباح",
            value: "morning",
          },
          {
            name: "أذكار المساء",
            value: "evening",
          },
          {
            name: "أذكار عامة",
            value: "general",
          },
        ),
    )
    .addBooleanOption((option) =>
      option
        .setName("خاص")
        .setDescription(
          "إظهار الذكر لك فقط",
        )
        .setRequired(false),
    ),

  async execute(interaction) {
    const category =
      interaction.options.getString(
        "التصنيف",
      ) || "all";

    const ephemeral =
      interaction.options.getBoolean(
        "خاص",
      ) ?? false;

    const selectedAdhkar =
      getAdhkarByCategory(category);

    if (selectedAdhkar.length === 0) {
      await interaction.reply({
        content:
          "لا توجد أذكار في هذا التصنيف حاليًا.",
        ephemeral: true,
      });

      return;
    }

    const index = Math.floor(
      Math.random() * selectedAdhkar.length,
    );

    const item = selectedAdhkar[index];

    const embed = createAdhkarEmbed(
      item,
      index,
      selectedAdhkar.length,
    );

    const row = createNavigationRow(
      interaction.user.id,
      category,
      index,
      selectedAdhkar.length,
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral,
    });
  },
};

export {
  createAdhkarEmbed,
  createNavigationRow,
};
