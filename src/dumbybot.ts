const { Client, LocalAuth} = require('whatsapp-web.js');
import {answer}  from "./knowledgebase";
import {GROUP, BOT_NUMBER, ADM_NUMBERS} from './resource'


export default class DumbyBot{
    client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: { headless: false, args: ['--no-sandbox'], }
        });

    constructor(){
        this.initialize();
    }

    private initialize(){
        this.client.initialize();

        this.client.on('loading_screen', (percent: string, message: string) => {
            console.log('LOADING SCREEN', percent, message);
        });

        this.client.on('qr', (qr: any) => {
            // NOTE: This event will not be fired if a session is specified.
            console.log('QR RECEIVED', qr);
        });

        this.client.on('authenticated', () => {
            console.log('AUTHENTICATED');
        });

        this.client.on('auth_failure', (msg: string) => {
            // Fired if session restore was unsuccessful
            console.error('AUTHENTICATION FAILURE', msg);
        });

        this.client.on('ready', () => {
            console.log('READY');
        });

        this.client.on('message', async (msg: any) => {
            // console.log('MESSAGE RECEIVED', msg);
            let chat = await msg.getChat();
            // let group = await this.client.getInviteInfo('LnTSIDMMveTD1zR9dThcjl')
            // console.log(group)
            try{
                let contact = await msg.getContact();
                console.log(contact)
                console.log(contact.number)
                let commongroups: [] = await this.client.getCommonGroups(`${contact.number}@c.us`)
                console.log("commongroups")
                console.log(commongroups)
                if(chat.isGroup && chat.id.user === GROUP){
                    let mentions = await msg.getMentions()
                    if(mentions.some( (item: any) => item.isMe)){
                        msg.reply(answer(msg.body.replace(`@${BOT_NUMBER}`,'').trim(), msg.author))
                    }    
                }
                else if (ADM_NUMBERS.includes(contact.number)) {
                    console.log('PRIVATE CHAT WITH MANAGER')
                    if(msg.type === 'vcard'){
                        msg.reply(`Por favor, envie: \n/adicionar [codigo do país][DDD sem zero][número do telefone] --> /adicionar 5511999999999`)
                    } 
                    else if (msg.body.includes('/enviar')) {
                        console.log('FORWARDING')
                        if(msg.hasQuotedMsg){
                            let message = await msg.getQuotedMessage()
                            message.forward(`${GROUP}@g.us`)
                        }
                        else
                        {
                            msg.forward(`${GROUP}@g.us`)
                        }
                    }
                    else if(msg.body.includes('/adicionar')) {
                        let number = msg.body.replace('/adicionar','').trim()
                        let numberId = await this.client.getNumberId(number)
                        if(numberId !== null){
                        console.log(numberId !== null)
                            let chats = await this.client.getChats()
                            let group = chats.find((chat: any) => chat.id.user === GROUP)
                            group.addParticipants([`${number}@c.us`])
                            .then(() =>{
                                msg.reply('adicionado com sucesso')
                            }).catch((error: Error) =>{
                                console.error(error)
                                msg.reply('não foi possivel adicionar')
                            })
                            
                        }else
                        {
                                msg.reply('não foi possivel adicionar, o contato não esta no whatsapp')
                        }
                    }
                }
                else if(commongroups.length === 0){
                        msg.reply(`*Te conheço!?*\nNão te encontrei em nenhum grupo que eu estou`)

                }
            }
            catch(error){
                console.error(error)
            }
        });

        this.client.on('group_join', (notification: any) => {
            // User has joined or been added to the group.
            notification.reply(answer('/bemvindo', ''));
        });

        this.client.on('disconnected', (reason: any) => {
            console.log('Client was logged out', reason);
        });
    }
}