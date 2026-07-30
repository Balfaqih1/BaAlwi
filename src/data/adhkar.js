export const adhkar = [
  {
    id: 1,
    category: "morning",
    title: "ذكر الصباح",
    text: "أصبحنا وأصبح الملك لله، والحمد لله.",
    count: 1,
    source: "أضف المصدر الموثق هنا",
  },
  {
    id: 2,
    category: "morning",
    title: "ذكر الصباح",
    text: "اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.",
    count: 1,
    source: "أضف المصدر الموثق هنا",
  },
  {
    id: 3,
    category: "evening",
    title: "ذكر المساء",
    text: "أمسينا وأمسى الملك لله، والحمد لله.",
    count: 1,
    source: "أضف المصدر الموثق هنا",
  },
  {
    id: 4,
    category: "general",
    title: "تسبيح",
    text: "سبحان الله وبحمده.",
    count: 100,
    source: "أضف المصدر الموثق هنا",
  },
];

export function getAdhkarByCategory(category) {
  if (!category || category === "all") {
    return adhkar;
  }

  return adhkar.filter(
    (item) => item.category === category,
  );
}
