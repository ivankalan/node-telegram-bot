const TelegramBot = require('node-telegram-bot-api');
const k8s = require('@kubernetes/client-node');

require('dotenv').config();

const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// handle error log
bot.on("polling_error", (msg) => console.log(msg));

// handle /start message
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Halo " + msg.from.first_name + ", ada yang bisa dibantu?",{
        "reply_markup": {
            "keyboard": [["/getpods"]]
        }
    });
});

// bot.onText(/\/getpods/, (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, resp);
// });

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'Oncheck');
// });

// handle /getpods command
const main = async () => {
    try {
        const pods = await k8sApi.listNamespacedPod('unified');
        const podList = pods.body.items.map(pod => pod.metadata.name);
        const podMessage = "Running pods: \n" + podList.join('\n');

        bot.onText(/\/getpods/, (msg) => {
            bot.sendMessage(msg.chat.id, podMessage, { reply_to_message_id: msg.message_id });
        });
    } catch (err) {
        const error = console.error(err);
        bot.sendMessage(msg.chat.id, error);
    }
};

main();