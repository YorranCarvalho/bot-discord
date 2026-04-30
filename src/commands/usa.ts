import type { Command } from "../types/commands.js";

const formatDollar = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export const usaCommand: Command = {
  name: "usa",
  description: "Simula uma doação aleatória",

  async execute(message) {
    const min = 1_000_000;
    const max = 30_000_000_000;

    const value = Math.floor(Math.random() * (max - min + 1)) + min;

    await message.reply(
      `Doação de **${formatDollar(value)} dólares** feita com sucesso a Israel 🇺🇸🇮🇱`
    );
  },
};