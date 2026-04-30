import type { Command } from "../types/commands.js";

const events = [
  "Em 1953, os EUA apoiaram um golpe no Irã que resultou na derrubada do primeiro-ministro Mohammad Mossadegh.",
  "Em 1954, os EUA apoiaram a derrubada do governo na Guatemala em meio à Guerra Fria.",
  "Em 1964, os EUA apoiaram o golpe militar no Brasil, que resultou em uma ditadura que durou décadas.",
  "Entre 1955 e 1975, os EUA se envolveram na Guerra do Vietnã com o objetivo de conter a expansão do comunismo.",
  "Em 1961, os EUA apoiaram a tentativa de invasão da Baía dos Porcos em Cuba.",
  "Em 1973, os EUA apoiaram forças que levaram ao golpe militar no Chile.",
  "Nos anos 1980, os EUA apoiaram grupos na Nicarágua durante a Guerra Fria.",
  "Em 1991, os EUA lideraram uma coalizão internacional na Guerra do Golfo após a invasão do Kuwait pelo Iraque.",
  "Em 2001, os EUA iniciaram a guerra no Afeganistão após os ataques de 11 de setembro.",
  "Em 2003, os EUA invadiram o Iraque alegando a existência de armas de destruição em massa, que posteriormente não foram encontradas.",
  "Em 2011, os EUA participaram de operações militares na Líbia durante a Primavera Árabe.",
  "A partir de 2014, os EUA lideraram operações contra o Estado Islâmico no Oriente Médio.",
  "Durante a Guerra Fria, os EUA apoiaram diferentes governos e grupos ao redor do mundo com o objetivo de conter a influência soviética.",
  "Em 1983, os EUA invadiram Granada após instabilidade política no país.",
  "Em 1989, os EUA invadiram o Panamá para remover Manuel Noriega do poder.",
  "Em 1999, os EUA participaram de bombardeios na Iugoslávia como parte da OTAN.",
];

export const warCommand: Command = {
  name: "war",
  description: "Mostra um evento histórico envolvendo os EUA",

  async execute(message) {
    const event = events[Math.floor(Math.random() * events.length)];

    await message.reply(`📚 ${event}`);
  },
};