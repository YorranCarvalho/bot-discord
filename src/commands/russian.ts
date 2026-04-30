import type { Command } from "../types/commands.js";

const ucraniaPlaces = [
  { name: "Lutsk", maps: "https://www.google.com/maps?q=50.7612,26.2839" },
  { name: "Rivne", maps: "https://www.google.com/maps?q=50.6199,26.2516" },
  { name: "Zhytomyr", maps: "https://www.google.com/maps?q=50.2547,28.6587" },
  { name: "Chernivtsi", maps: "https://www.google.com/maps?q=48.2915,25.9403" },
  { name: "Ivano-Frankivsk", maps: "https://www.google.com/maps?q=48.9226,24.7111" },
  { name: "Ternopil", maps: "https://www.google.com/maps?q=49.5535,25.5948" },
  { name: "Uzhhorod", maps: "https://www.google.com/maps?q=48.6208,22.2879" },
  { name: "Mukachevo", maps: "https://www.google.com/maps?q=48.4436,22.7174" },
  { name: "Khmelnytskyi", maps: "https://www.google.com/maps?q=49.4212,26.9965" },
  { name: "Kiev", maps: "https://www.google.com/maps?q=50.4501,30.5234" },
  { name: "Lviv", maps: "https://www.google.com/maps?q=49.8425,24.0322" },
  { name: "Odessa", maps: "https://www.google.com/maps?q=46.4825,30.7233" },
  { name: "Kharkiv", maps: "https://www.google.com/maps?q=49.9935,36.2304" },
  { name: "Dnipro", maps: "https://www.google.com/maps?q=48.4647,35.0462" },
  { name: "Donetsk", maps: "https://www.google.com/maps?q=48.0159,37.8028" },
  { name: "Zaporizhzhia", maps: "https://www.google.com/maps?q=47.8388,35.1396" },
  { name: "Luhansk", maps: "https://www.google.com/maps?q=48.5740,39.3078" },
  { name: "Vinnytsia", maps: "https://www.google.com/maps?q=49.2331,28.4682" },
  { name: "Myrhorod", maps: "https://www.google.com/maps?q=49.9875,33.5997" },
  { name: "Kryvyi Rih", maps: "https://www.google.com/maps?q=47.9105,33.3918" },
  { name: "Chernihiv", maps: "https://www.google.com/maps?q=51.5055,31.2849" },
  { name: "Sumy", maps: "https://www.google.com/maps?q=50.9077,34.7981" },
  { name: "Kherson", maps: "https://www.google.com/maps?q=46.6354,32.6169" },
  { name: "Poltava", maps: "https://www.google.com/maps?q=49.5883,34.5514" },
  { name: "Cherkasy", maps: "https://www.google.com/maps?q=49.4444,32.0598" },
];

export const russiaCommand: Command = {
  name: "russia",
  description: "Manda um local aleatório na Ucrânia",

  async execute(message) {
    const place = ucraniaPlaces[Math.floor(Math.random() * ucraniaPlaces.length)];

    await message.reply(
      `🚀 Parabéns, seu missil caiu com sucesso em **${place.name}**!\n${place.maps}`
    );
  },
};