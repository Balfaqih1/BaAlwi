import {
  createAdhkarEmbed,
  createNavigationRow,
} from "../commands/Adhkar/adhkar.js";

import {
  getAdhkarByCategory,
} from "../data/adhkar.js";

function calculateNextIndex(
  action,
  currentIndex,
  total,
) {
  if (total <= 1) {
    return 0;
  }

  if (action === "next") {
    return (currentIndex + 1) % total;
  }

  if (action === "previous") {
    return (
      currentIndex - 1 + total
    ) % total;
  }

  if (action === "random") {
    let randomIndex = currentIndex;

    while (
      randomIndex === currentIndex &&
      total > 1
    ) {
      randomIndex = Math.floor(
        Math.random() * total,
      );
    }

    return randomIndex;
  }

  return currentIndex;
}

export default {
  customId: "adhkar",

  async execute(interaction, client, args) {
    const [
      action,
      ownerId,
      category,
      currentIndexValue,
    ] = args;

    if (interaction.user.id !== ownerId) {
      await interaction.reply({
        content:
          "هذه الأزرار خاصة بالشخص الذي استخدم الأمر.",
        ephemeral: true,
      });

      return;
    }

    const selectedAdhkar =
      getAdhkarByCategory(category);

    if (selectedAdhkar.length === 0) {
      await interaction.update({
        content:
          "لم يعد هذا المحتوى متاحًا.",
        embeds: [],
        components: [],
      });

      return;
    }

    const currentIndex =
      Number.parseInt(
        currentIndexValue,
        10,
      );

    const safeCurrentIndex =
      Number.isInteger(currentIndex)
        ? currentIndex
        : 0;

    const nextIndex =
      calculateNextIndex(
        action,
        safeCurrentIndex,
        selectedAdhkar.length,
      );

    const item =
      selectedAdhkar[nextIndex];

    const embed =
      createAdhkarEmbed(
        item,
        nextIndex,
        selectedAdhkar.length,
      );

    const row =
      createNavigationRow(
        ownerId,
        category,
        nextIndex,
        selectedAdhkar.length,
      );

    await interaction.update({
      embeds: [embed],
      components: [row],
    });
  },
};
