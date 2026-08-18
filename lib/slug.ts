const persianMap: Record<string, string> = {
  آ: "a",
  ا: "a",
  ب: "b",
  پ: "p",
  ت: "t",
  ث: "s",
  ج: "j",
  چ: "ch",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "z",
  ر: "r",
  ز: "z",
  ژ: "zh",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "z",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "gh",
  ک: "k",
  گ: "g",
  ل: "l",
  م: "m",
  ن: "n",
  و: "v",
  ه: "h",
  ی: "y",
  ئ: "y",
  ء: "",
  " ": "-",
  "‌": "-",
};

export function slugifyFa(input: string): string {
  const normalized = input.trim().toLowerCase();

  let slug = "";
  for (const char of normalized) {
    if (persianMap[char]) {
      slug += persianMap[char];
      continue;
    }
    if (/[a-z0-9]/.test(char)) {
      slug += char;
      continue;
    }
    if (char === "-" || char === "_") {
      slug += "-";
    }
  }

  return slug.replace(/-+/g, "-").replace(/^-|-$/g, "") || "item";
}
