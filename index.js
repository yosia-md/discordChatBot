require('dotenv/config');
const { Client } =  require('discord.js');
const { OpenAI } = require('openai');

const client = new Client({
    intents: ['Guilds','GuildMembers','GuildMessages','MessageContent'],
})


client.on('ready', ()=> {
    console.log('The bot is online');
});

client.login(process.env.TOKEN);

const COMMAND_PREFIX ="!ask";
const CHANNELS = ['1200010717613527060','1200030362907181117','999569676596158564','1200032001743401051','1200034978864562257'];

const openai = new OpenAI({
    apiKey : process.env.OPENAI_KEY,
})

client.on('messageCreate', async (message) => { 
    if(message.author.bot) return;
    
    if(!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;
    if(message.content.startsWith(COMMAND_PREFIX)){
        await message.channel.sendTyping();
    const sendTypingInterval = setInterval(() => {
        message.channel.sendTyping();
    },5000);

    let convs = [];
    convs.push({
        role:'system',
        content: 'chat gpt blablabla'
    });

    let prevMessages = await message.channel.messages.fetch({limit:10});
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
        if(msg.author.bot && msg.author.id !== client.user.id)return;
        if(message.content.startsWith(COMMAND_PREFIX)){
            const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

            if(msg.author.id == client.user.id){
                convs.push({
                    role:'assistant',
                    name: username,
                    content:msg.content,
                });
                return;
            }
    
            convs.push({
                role :'user',
                name: username,
                content : msg.content,
            });

        }


    })

    const response = await openai.chat.completions.create({
        model:'gpt-3.5-turbo',
        messages: convs,

    }).catch((error) => console.error('OpenAI Error :\n',error));
    clearInterval(sendTypingInterval);
    if(!response){
        message.reply("There is something wrong with my AI please tell my master!");
        return;
    }

    const responseMsg =  message.reply(response.choices[0].message.content);
    const chunckSizeLimit = 2000;

    for(let i = 0 ; i < responseMsg.length ; i+= chunckSizeLimit){
        const chunck = responseMsg.substring(i,i + chunkSizeLimit);
        await message.reply(chunck);
    }

    }

    

   
});
