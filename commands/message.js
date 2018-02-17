const randomstring = require("randomstring");
const MessageBuilder = require("../modules/MessageBuilder");

module.exports = async(client, msg, args) => {
	let number = args.substring(0, args.indexOf(" ")).trim();
	let content = args.substring(args.indexOf(" ") + 1).trim();
	if (!args) {
		return msg.reply("Correct usage: `>message <Number> <Content>`. 1 message costs 2 credits. Receiving messages is free by using `>mailbox messages`.");
	}
	let account;
	try {
		account = await Accounts.findOne({ _id: args });
		if (!account) throw new Error();
	} catch (err) {
		await Accounts.create(new Accounts({
			_id: msg.author.id,
		}));
		await client.users.fetch(msg.author.id).send("You don't have an account created...Creating an account for you! Please also read for information on payment: <http://discordtel.readthedocs.io/en/latest/Payment/>");
	}
	if (account.balance < 2) {
		return msg.reply("Insufficient funds! 1 message costs 2 credits.");
	}
	account.balance -= 2;
	await account.save();

	let toNumberDoc;
	try {
		toNumberDoc = await Numbers.findOne({ number: number });
		if (!toNumberDoc) throw new Error();
	} catch (err) {
		return msg.reply("This number does not exist.");
	}
	let fromNumberDoc;
	try {
		fromNumberDoc = await Numbers.findOne({ _id: msg.channel.id });
		if (!fromNumberDoc) throw new Error();
	} catch (err) {
		return msg.reply("You dont have a number in this channel!");
	}
	let mailbox;
	try {
		mailbox = await Mailbox.findOne({ _id: toNumberDoc._id });
		if (!mailbox) throw new Error();
	} catch (err) {
		return msg.reply("This number does not have their mailbox set up.");
	}
	mailbox.messages.push({
		_id: randomstring.generate({ length: "8", charset: "alphanumeric" }),
		from: fromNumberDoc.number,
		content: content,
	});
	await mailbox.save();
	client.api.channels(mailbox._id).messages.post(MessageBuilder({
		content,
	}));
	msg.reply("Your message was successfully sent.");
};
