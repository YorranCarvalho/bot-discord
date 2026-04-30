import type { Command } from "../types/commands.js";

const peopleAnswers = [
  "teu pai",
  "tua mãe",
  "teu pai morto",
  "tua mãe piranha",
  "teu irmão doente",
  "tua tia drogada",
];

const yesNoAnswers = ["sim", "não"];

const randomItem = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const normalize = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// ⚠️ cuidado com eval, aqui controlamos bem
const tryMath = (text: string): number | null => {
  try {
    // pega só números e operadores básicos
    const sanitized = text.replace(/[^0-9+\-*/().]/g, "");

    if (!sanitized) return null;

    const result = Function(`"use strict"; return (${sanitized})`)();

    if (typeof result === "number" && !isNaN(result)) {
      return result;
    }

    return null;
  } catch {
    return null;
  }
};

export const perguntaCommand: Command = {
  name: "pergunta",
  description: "Responde uma pergunta com sabedoria duvidosa",

  async execute(message, args) {
    const question = args.join(" ").trim();

    if (!question) {
      await message.reply("❌ Você precisa mandar uma pergunta, imbecil. O comando é bem claro");
      return;
    }

    if (!question.includes("?")) {
      await message.reply("❌ Isso nem parece uma pergunta. Coloca `?` no final, animal.");
      return;
    }

    const normalizedQuestion = normalize(question);

    // 🔥 SIX SEVEN RULE
    if (
      normalizedQuestion.includes("six seven") ||
      normalizedQuestion.includes("67")
    ) {
      await message.reply("676767676767676767676767");
      return;
    }

    if (normalizedQuestion.includes("quem é você?") ||
        normalizedQuestion.includes("quem é vc?") ||
        normalizedQuestion.includes("quem é voce?") ||
        normalizedQuestion.includes("quem e você?") ||
        normalizedQuestion.includes("quem e vc?") ||
        normalizedQuestion.includes("quem e voce?")) {
      await message.reply("Teu pai de calcinha.");
      return;
    }

    const mathResult = tryMath(normalizedQuestion);

    if (mathResult === 67) {
      await message.reply("676767676767676767676767");
      return;
    }

    if (normalizedQuestion.includes("quanto")) {
      await message.reply("smt");
      return;
    }

    if (
      normalizedQuestion.startsWith("vc sabe") ||
      normalizedQuestion.startsWith("voce sabe") ||
      normalizedQuestion.startsWith("vc ") ||
      normalizedQuestion === "vc?" ||
      normalizedQuestion.startsWith("voce ") ||
      normalizedQuestion === "voce?"
    ) {
      await message.reply(randomItem(yesNoAnswers));
      return;
    }

    if (normalizedQuestion.includes("quem")) {
      await message.reply(randomItem(peopleAnswers));
      return;
    }

    await message.reply(randomItem([...peopleAnswers, ...yesNoAnswers]));
  },
};