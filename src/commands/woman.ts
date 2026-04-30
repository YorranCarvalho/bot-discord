import { EmbedBuilder } from "discord.js";
import type { Command } from "../types/commands.js";

interface PexelsPhoto {
  src: {
    original: string;
    large: string;
    medium: string;
  };
}

interface PexelsResponse {
  photos: PexelsPhoto[];
}

const categories: Record<string, string[]> = {
  default: ["woman model", "boudoir"],
  soft: ["sensual woman", "boudoir"],
  anime: ["anime girl", "ecchi"],
  goth: ["goth girl", "dark fashion", "alternative model", "sexy"],
  asian: ["asian woman", "sensual woman", "sexy"],
  russian: ["russian woman model", "sensual woman", "seansual", "sexy"],
  latina: ["latina woman model", "sensual woman", "sexy"],
};

const randomItem = <T>(arr: T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export const womanCommand: Command = {
  name: "woman",
  description: "Manda uma imagem baseada na categoria",

  async execute(message, args) {
    const sub = args[0]?.toLowerCase();
    const selected = sub && categories[sub] ? categories[sub] : categories.default;

    const query = randomItem(selected);

    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20`,
        {
          headers: {
            Authorization: process.env.PEXELS_API_KEY!,
          },
        }
      );

      const data: PexelsResponse = await res.json();

      if (!data.photos || data.photos.length === 0) {
        await message.reply("❌ Não achei nada pra essa categoria.");
        return;
      }

      const photo = randomItem(data.photos);
      const imageUrl = photo.src.large;

      const label = sub ? `🔥 Categoria: ${sub}` : "🔥 Aqui vai:";

      const embed = new EmbedBuilder()
        .setTitle(label)
        .setImage(imageUrl)
        .setColor(0xff69b4);

      await message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await message.reply("❌ Deu erro ao buscar imagem.");
    }
  },
};