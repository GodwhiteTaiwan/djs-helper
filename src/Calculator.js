const math = require("mathjs");
const Discord = require("discord.js");
const functions = require("../functions/function");

module.exports = async (options) => {
  if (!options.interaction) {
    throw new Error(
      "Djs-helper Error: interaction argument was not specified."
    );
  }
  if (typeof options.interaction !== "object") {
    throw new TypeError(
      "Djs-helper Error: Invalid Discord Interaction was provided."
    );
  }

  if (!options.embed) options.embed = {};
  if (typeof options.embed !== "object") {
    throw new TypeError("Djs-helper Error: embed must be an object.");
  }

  if (!options.embed.title) {
    options.embed.title = "計算機";
  }
  if (typeof options.embed.title !== "string") {
    throw new TypeError("Djs-helper Error: embed title must be a string.");
  }

  if (!options.embed.color) options.embed.color = 0x92e6a7;
  if (typeof options.embed.color !== "number") {
    throw new TypeError("Djs-helper Error: embed color must be a number.");
  }

  if (!options.embed.disabledColor) options.embed.color = 0x808080;
  if (typeof options.embed.disabledColor !== "number") {
    throw new TypeError("Djs-helper Error: disabled color must be a number.");
  }

  if (!options.embed.footer) {
    options.embed.footer = "©️ Godwhite Development";
  }
  if (typeof options.embed.footer !== "string") {
    throw new TypeError("Djs-helper Error: embed footer must be a string.");
  }

  if (!options.embed.timestamp) options.embed.timestamp = true;
  if (typeof options.embed.timestamp !== "boolean") {
    throw new TypeError("Djs-helper Error: timestamp must be a boolean.");
  }

  if (!options.disabledQuery) {
    options.disabledQuery = "Calculator is disabled!";
  }
  if (typeof options.disabledQuery !== "string") {
    throw new TypeError("Djs-helper Error: disabledQuery must be a string.");
  }

  if (!options.invalidQuery) {
    options.invalidQuery = "The provided equation is invalid!";
  }
  if (typeof options.invalidQuery !== "string") {
    throw new TypeError("Djs-helper Error: invalidQuery must be a string.");
  }

  if (!options.othersMessage) {
    options.othersMessage = "Only <@{{author}}> can use the buttons!";
  }
  if (typeof options.othersMessage !== "string") {
    throw new TypeError("Djs-helper Error: othersMessage must be a string.");
  }

  await options.interaction.deferReply();

  let str = " ";
  let stringify = "```\n" + str + "\n```";

  const row = [];
  const rows = [];

  const button = new Array([], [], [], [], []);
  const buttons = new Array([], [], [], [], []);

  const text = [
    "(",
    ")",
    "^",
    "%",
    "AC",
    "7",
    "8",
    "9",
    "÷",
    "DC",
    "4",
    "5",
    "6",
    "x",
    "⌫",
    "1",
    "2",
    "3",
    "-",
    "\u200b",
    ".",
    "0",
    "=",
    "+",
    "\u200b",
  ];

  let cur = 0;
  let current = 0;

  for (let i = 0; i < text.length; i++) {
    if (button[current].length === 5) current++;
    button[current].push(
      functions.createButton(text[i], false, functions.getRandomString)
    );
    if (i === text.length - 1) {
      for (const btn of button) row.push(functions.addRow(btn));
    }
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle(options.embed.title)
    .setDescription(stringify)
    .setColor(options.embed.color)
    .setFooter({
      text: options.embed.footer,
    });
  if (options.embed.timestamp) {
    embed.setTimestamp();
  }

  options.interaction
    .editReply({
      embeds: [embed],
      components: row,
    })
    .then(async (msg) => {
      async function edit() {
        const _embed = new Discord.EmbedBuilder()
          .setTitle(options.embed.title)
          .setDescription(stringify)
          .setColor(options.embed.color)
          .setFooter({
            text: options.embed.footer,
          });
        if (options.embed.timestamp) {
          _embed.setTimestamp();
        }
        msg.edit({
          embeds: [_embed],
          components: row,
        });
      }

      async function lock() {
        const _embed = new Discord.EmbedBuilder()
          .setTitle(options.embed.title)
          .setColor(options.embed.disabledColor)
          .setDescription(stringify)
          .setFooter({
            text: options.embed.footer,
          });
        if (options.embed.timestamp) {
          _embed.setTimestamp();
        }
        for (let i = 0; i < text.length; i++) {
          if (buttons[cur].length === 5) cur++;
          buttons[cur].push(
            functions.createButton(text[i], true, functions.getRandomString)
          );
          if (i === text.length - 1) {
            for (const btn of buttons) rows.push(functions.addRow(btn));
          }
        }

        msg.edit({
          embeds: [_embed],
          components: rows,
        });
      }

      const calc = msg.createMessageComponentCollector({
        filter: (fn) => fn,
      });

      calc.on("collect", async (btn) => {
        if (btn.user.id !== options.interaction.user.id) {
          return btn.reply({
            content: options.othersMessage.replace(
              "{{author}}",
              options.interaction.user.id
            ),
            ephemeral: true,
          });
        }
        await btn.deferUpdate();
        if (btn.customId === "calAC") {
          str += " ";
          stringify = "```\n" + str + "\n```";
          edit();
        } else if (btn.customId === "calx") {
          str += "*";
          stringify = "```\n" + str + "\n```";
          edit();
        } else if (btn.customId === "cal÷") {
          str += "/";
          stringify = "```\n" + str + "\n```";
          edit();
        } else if (btn.customId === "cal⌫") {
          if (str === " " || str === "" || str === null || str === undefined) {
            return;
          } else {
            str = str.split("");
            str.pop();
            str = str.join("");
            stringify = "```\n" + str + "\n```";
            edit();
          }
        } else if (btn.customId === "cal=") {
          if (str === " " || str === "" || str === null || str === undefined) {
            return;
          } else {
            try {
              str += " = " + math.evaluate(str);
              stringify = "```\n" + str + "\n```";
              edit();
              str = " ";
              stringify = "```\n" + str + "\n```";
            } catch (e) {
              str = options.invalidQuery;
              stringify = "```\n" + str + "\n```";
              edit();
              str = " ";
              stringify = "```\n" + str + "\n```";
            }
          }
        } else if (btn.customId === "calDC") {
          str = options.disabledQuery;
          stringify = "```\n" + str + "\n```";
          edit();
          calc.stop();
          lock();
        } else {
          str += btn.customId.replace("cal", "");
          stringify = "```\n" + str + "\n```";
          edit();
        }
      });
    });
};
