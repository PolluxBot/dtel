const permCheck = require("../modules/permChecker");
const MessageBuilder = require("../modules/MessageBuilder");

module.exports = async(client, message, args) => {
	let perms = await permCheck(client, message.author.id);
	if (!perms.support) return;
	if (!args) return message.reply("u forgot id :b:");
	let document, guildBlacklist, userBlacklist;
	try {
		document = await Blacklist.findOne({ _id: args });
		if (!document) throw new Error();
	} catch (err) {
		//
	}
	if (document) {
		await document.remove();
		client.api.channels(process.env.LOGSCHANNEL).messages.post(MessageBuilder({
			content: `:wrench: Guild ID \`${args}\` is removed from blacklist by ${message.author.username}.`,
		}));
	} else {
		try {
			guildBlacklist = client.api.guilds(args).get();
		} catch (err) {
			try {
				userBlacklist = await client.users.fetch(args);
			} catch (err2) {
				return message.reply("Invalid ID");
			}
		}
	}
	if (guildBlacklist) {
		Blacklist.create(new Blacklist({ _id: args, type: "guild" }));
		client.api.channels(process.env.LOGSCHANNEL).messages.post(MessageBuilder({
			content: `:hammer: Guild ID \`${args}\` is added to the blacklist by ${message.author.username}.`,
		}));
		message.reply("Done");
	} else if (userBlacklist) {
		Blacklist.create(new Blacklist({ _id: args, type: "user" }));
		client.api.channels(process.env.LOGSCHANNEL).messages.post(MessageBuilder({
			content: `:hammer: User ID \`${args}\` is added to the blacklist by ${message.author.username}.`,
		}));
		message.reply("Done");
	}
};
