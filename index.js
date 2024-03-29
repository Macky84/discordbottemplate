console.log("Loading...");

const {
    PREFIX,
    HEADER_TXT,
    BOT_OWNERS,
    MAINTENANCE,
} = require("./config.json");

const { Client } = require("discord.js");
const client = new Client();
require("dotenv").config();

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getID = (id) => {
    if (id == null || id == undefined) return null;
    id = id.author || id;
    id = id.user || id;
    id = id.guild || id;
    id = id.id || id;
    return id;
};

const isBotOwner = (id) => {
    return BOT_OWNERS.includes(getID(id));
};

const reactDenied = async (message) => {
    await message.react("\u274e");
};
const reactCooldown = async (message) => {
    await message.react("\u23f2");
};

const escape = (text) => {
    return Discord.Util.escapeMarkdown(text)
        .replace(/\@/g, "@\u200b")
        .replace(/\r\n/gm, "\n")
        .replace(/\r/gm, "\n");
};

const generateInvite = (permissions, guild) => {
    return (
        `https://discord.com/api/oauth2/authorize?scope=bot&client_id=${client.user.id}&permissions=${permissions}` +
        (guild ? `&guild_id=${getID(guild)}` : ``)
    );
};

const addCooldown = async (message) => {
    cooldowns.push(message.author.id);
    setTimeout(() => {
        var i = cooldowns.indexOf(message.author.id);
        if (i > -1) cooldowns.splice(i, 1);
        var j = cooldowns2.indexOf(message.author.id);
        if (j > -1) cooldowns2.splice(j, 1);
    }, 3000);
}

const addCooldownReaction = async (message) => {
    if (cooldowns2.indexOf(message.author.id) == -1) {
        cooldowns2.push(message.author.id);
        await reactCooldown(message);
    }
}

const cantUse = async (message, ignoreMaintenance) => {
    if (isBotOwner(message)) return false;
    if (cooldowns.indexOf(message.author.id) > -1) {
	    await addCooldownReaction(message);
        return true;
    }
    if (!ignoreMaintenance && MAINTENANCE) {
        await reactDenied(message);
        await message.channel.send(
            "Bot is currently in maintenance, check back later"
        );
        return true;
    }
    await addCooldown(message);
    return false;
};

let cooldowns = [];
let cooldowns2 = [];

client.on("ready", async () => {
    console.log("Ready!");
    await client.user.setActivity(`${PREFIX}help`, { type: "PLAYING" });
});

client.on("message", async (message) => {
    if (
        !message.content ||
        !message.author ||
        message.author.bot ||
        // Checks if bot has permission SEND_MESSAGES
        // Return false if no guild || has permission, true if no permission
        message.guild
            ? !message.channel
                  .permissionsFor(message.guild.me)
                  .has("SEND_MESSAGES")
            : false
    )
        return;

    var cmd = message.content.trim();
    cmd = cmd.replace(/[\s\n\r\t]/, " ").replace("  +", " ");

    var args = cmd.split(" ");

    if (!cmd.startsWith(PREFIX)) return;

    cmd = args.shift().toLowerCase();
    cmd = cmd.substring(PREFIX.length);

    var arg = args.join(" ");

    var cmdUsed = true;

    switch (cmd) {
        case "ping":
            if (await cantUse(message)) return;
            await message.channel.send("pong");
            break;
        case "help":
            if (await cantUse(message)) return;
            await message.channel.send((
                HEADER_TXT +
                    "\n" +
                    "commands:\n" +
                    "!ping\n" +
                    "!help\n" +
                    "!invite").replace(/\!/g, PREFIX)
            );
            break;
        case "invite":
            if (await cantUse(message)) return;
            await message.channel.send(
                HEADER_TXT +
                    "\n" +
                    `Normal Invite: <${generateInvite(322624)}>\n` +
                    `Admin Invite: <${generateInvite(8)}>`
            );
            break;
        default:
            cmdUsed = false;
    }
});

console.log("Logging in...");
client.login(process.env.TOKEN);

process.on("SIGUSR1", process.exit);
process.on("SIGUSR2", process.exit);
process.on("SIGINT", process.exit);
process.on("exit", process.exit);
process.on("uncaughtException", (err) => {
    console.error(err);
    process.exit();
});

