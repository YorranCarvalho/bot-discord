import type { Command } from "../types/commands.js";

const iranPlaces = [
  { name: "Teerã", maps: "https://www.google.com/maps?q=35.6892,51.3890" },
  { name: "Mashhad", maps: "https://www.google.com/maps?q=36.2605,59.6168" },
  { name: "Isfahan", maps: "https://www.google.com/maps?q=32.6546,51.6680" },
  { name: "Shiraz", maps: "https://www.google.com/maps?q=29.5926,52.5836" },
  { name: "Tabriz", maps: "https://www.google.com/maps?q=38.0962,46.2738" },
  { name: "Qom", maps: "https://www.google.com/maps?q=34.6416,50.8746" },
  { name: "Ahvaz", maps: "https://www.google.com/maps?q=31.3183,48.6706" },
  { name: "Kermanshah", maps: "https://www.google.com/maps?q=34.3277,47.0778" },
  { name: "Rasht", maps: "https://www.google.com/maps?q=37.2808,49.5832" },
  { name: "Yazd", maps: "https://www.google.com/maps?q=31.8974,54.3569" },
  { name: "Kerman", maps: "https://www.google.com/maps?q=30.2839,57.0834" },
  { name: "Urmia", maps: "https://www.google.com/maps?q=37.5527,45.0761" },
  { name: "Ardabil", maps: "https://www.google.com/maps?q=38.2498,48.2933" },
  { name: "Bandar Abbas", maps: "https://www.google.com/maps?q=27.1832,56.2666" },
  { name: "Hamadan", maps: "https://www.google.com/maps?q=34.7980,48.5146" },
  { name: "Sanandaj", maps: "https://www.google.com/maps?q=35.3144,46.9923" },
  { name: "Zanjan", maps: "https://www.google.com/maps?q=36.6736,48.4787" },
  { name: "Gorgan", maps: "https://www.google.com/maps?q=36.8456,54.4393" },
  { name: "Qazvin", maps: "https://www.google.com/maps?q=36.2688,50.0041" },
  { name: "Bushehr", maps: "https://www.google.com/maps?q=28.9234,50.8203" },
  { name: "Zahedan", maps: "https://www.google.com/maps?q=29.4963,60.8629" },
  { name: "Ilam", maps: "https://www.google.com/maps?q=33.6374,46.4227" },
  { name: "Bojnord", maps: "https://www.google.com/maps?q=37.4747,57.3290" },
  { name: "Sabzevar", maps: "https://www.google.com/maps?q=36.2140,57.6819" },
  { name: "Kashan", maps: "https://www.google.com/maps?q=33.9850,51.4090" },
];

export const israelCommand: Command = {
  name: "israel",
  description: "Manda um local aleatório no Irã (zoeira)",

  async execute(message) {
    const place = iranPlaces[Math.floor(Math.random() * iranPlaces.length)];

    await message.reply(
      `🚀 Parabéns, seu missil caiu com sucesso em **${place.name}**!\n${place.maps}`
    );
  },
};