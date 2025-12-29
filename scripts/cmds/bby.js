const axios = require("axios");

const baseApiUrl = async () => {
  return "https://meheraz-bby-api.onrender.com";
};

module.exports.config = {
  name: "bby",
  aliases: ["baby", "bby", "bbe", "babe"],
  version: "1.0.0",
  author: "Meheraz~",
  role: 0,
  category: "chat",
  description: "Auto chat bot with teach & reply toggle",
  guide: {
    en:
      "{pn} bby hi\n" +
      "{pn} bby teach question - answer\n",
  },
};

// Store teach counts per user
const teachCounts = new Map();

module.exports.onStart = async ({ api, event, args }) => {
  const uid = event.senderID;
  const text = args.join(" ").trim();
  const link = await baseApiUrl();

  try {
    if (!args[0]) return;

    if (args[0] === "teach") {
      const teachText = text.replace("teach", "").trim();
      const [ask, ans] = teachText.split(/\s*-\s*/);

      if (!ask || !ans) {
        return api.sendMessage(
          "Use: !bot teach question - answer",
          event.threadID,
          event.messageID
        );
      }

      // Get teacher name
      const userInfo = await api.getUserInfo(uid);
      const teacherName = userInfo[uid]?.name || "Anonymous";

      // Update teach count for this user
      const currentCount = teachCounts.get(uid) || 0;
      teachCounts.set(uid, currentCount + 1);

      await axios.get(
        `${link}/bby/teach?ask=${encodeURIComponent(
          ask
        )}&ans=${encodeURIComponent(ans)}&uid=${uid}&teacher=${encodeURIComponent(teacherName)}`
      );

      return api.sendMessage(
        `âœ… Teacher: ${teacherName}\nðŸ“š Teach Count: ${currentCount + 1}\nLearned:\n"${ask}" âžœ "${ans}"`,
        event.threadID,
        event.messageID
      );
    }

    // Optional: Add command to check teach stats
    if (args[0] === "teachstats") {
      const userInfo = await api.getUserInfo(uid);
      const userName = userInfo[uid]?.name || "Anonymous";
      const userCount = teachCounts.get(uid) || 0;
      
      return api.sendMessage(
        `ðŸ“Š Teaching Statistics:\n\nðŸ‘¤ Name: ${userName}\nðŸ“š Total Teachings: ${userCount}`,
        event.threadID,
        event.messageID
      );
    }

  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "Error occurred",
      event.threadID,
      event.messageID
    );
  }
};

module.exports.onChat = async ({ api, event }) => {
  try {
    const body = event.body?.toLowerCase();
    if (!body) return;

    if (
      body.startsWith("bot") ||
      body.startsWith("baby") ||
      body.startsWith("bby") ||
      body.startsWith("jan") ||
      body.startsWith("janu")
    ) {
      const msg = body.replace(/^\S+\s*/, "");

      if (!msg) {
        const ran = [
                "𝙖𝙢𝙖𝙠𝙚 𝙙𝙖𝙠𝙡𝙖 𝙢𝙤𝙣𝙚 𝙝𝙤𝙞?🙆",
                "Bol suntechi 🐍",
                "KI ᑭᖇOᗷᒪEᗰ ᗷᗷY?🙂",
                "~𝙔𝙖𝙢𝙚𝙩𝙚 𝙆𝙪𝙙𝙖𝙨𝙖𝙞🐶",
                "𝙅𝙖 𝙗𝙤𝙡𝙗𝙞 𝙚𝙠𝙨𝙝𝙖𝙩𝙚 𝙗𝙤𝙡𝙚 𝙛𝙚𝙡🤷",
                "𝙀𝙮 𝙩𝙤 𝙖𝙢𝙞 𝙚 𝙙𝙞𝙠𝙚🙋",
                "𝙃𝙖 𝙗𝙤𝙡𝙤 𝙠𝙞 𝙗𝙤𝙡𝙗𝙖- 𝘼𝙢𝙞 𝙨𝙝𝙪𝙣𝙩𝙚𝙨𝙞👂"
        ];
        return api.sendMessage(
          ran[Math.floor(Math.random() * ran.length)],
          event.threadID,
          (err, info) => {
            if (!err) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: "bot",
                author: event.senderID
              });
            }
          },
          event.messageID
        );
      }

      const res = await axios.get(
        `${await baseApiUrl()}/bby?text=${encodeURIComponent(msg)}`
      );

      return api.sendMessage(
        res.data.text,
        event.threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              author: event.senderID
            });
          }
        },
        event.messageID
      );
    }
  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "Chat error",
      event.threadID,
      event.messageID
    );
  }
};

module.exports.onReply = async ({ api, event }) => {
  try {
    if (event.type !== "message_reply") return;

    const res = await axios.get(
      `${await baseApiUrl()}/bby?text=${encodeURIComponent(
        event.body?.toLowerCase()
      )}`
    );

    return api.sendMessage(
      res.data.text,
      event.threadID,
      (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "bot",
            author: event.senderID
          });
        }
      },
      event.messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "Reply error",
      event.threadID,
      event.messageID
    );
  }
};
