const { Client, LocalAuth, Buttons} = require('whatsapp-web.js');
import { Console } from "console";
import {answer}  from "./knowledgebase";
import {GROUP, BOT_NUMBER, ADM_NUMBERS} from './resource'

function normalize(str: string) {
  return str
    .toLowerCase() // make sure string is lowercase
    .replace(/\s+/gm, '')
    .replace('^\d','')
}

export default class DumbyBot{
    client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: { headless: true, args: ['--no-sandbox'], }
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
            try{
                console.log('AUTHENTICATED');
            }
            catch(error){
                console.error(error)
            }
        });

        this.client.on('auth_failure', (msg: string) => {
            // Fired if session restore was unsuccessful
            try{
                console.error('AUTHENTICATION FAILURE', msg);
            }
            catch(error){
                console.error(error)
            }
        });

        this.client.on('ready', () => {
            try{
                console.log('READY');
            }
            catch(error){
                console.error(error)
            }
        });


        this.client.on('message', async (msg: any) => {
                console.debug('AWAITING MESSAGES');
            
            try{
                // console.log('MESSAGE RECEIVED', msg);
                let chat = await msg.getChat();
                
                const  adicionar = async (number: string) =>  {
                    console.debug("adicionar")
                    let numberId = await this.client.getNumberId(number)
                    if(numberId !== null){
                        let chats = await this.client.getChats()
                        let group = chats.find((chat: any) => chat.id.user === GROUP)
                        group.addParticipants([`${number}@c.us`])
                        .then((res: any) =>{
                            if(res === undefined)
                                msg.reply('*Não foi possivel adicionar*\n O usuário não permite que desconhecidos o adicione a grupos, é necessário que ele altere suas configurações ou que me adicione como contato.')

                            if(res.status === 207)
                                msg.reply('adicionado com sucesso, eu acho...')

                        }).catch((error: Error) =>{
                            console.error(error)
                            msg.reply('não foi possivel adicionar')
                        })
                    }
            }
            // let group = await this.client.getInviteInfo('LnTSIDMMveTD1zR9dThcjl')
            // console.log(group)
            
                let contact = await msg.getContact();
                let commongroups: [] = await this.client.getCommonGroups(`${contact.number}@c.us`)
                
                console.debug(commongroups)

                if(msg.from === 'status@broadcast'){
                    console.debug('status@broadcast')//ignore
                }
                else if(msg.body.replace(`@${BOT_NUMBER}`, '').includes('/adicionar')){
                    console.debug("includes('/adicionar')")
                    
                    if(ADM_NUMBERS.includes(contact.number)){

                        let number = msg.body.replace('/adicionar','')
                        number = normalize(number)
                        console.debug(number)
                        adicionar(number)
                    }
                    else
                    {
                        console.debug("includes('/adicionar') else")
                        
                        let body = await msg.body.replace(`@${BOT_NUMBER}`, '')
                        console.debug(body)
                        let button = new Buttons('É morador? '+body,[{body:'SIM, É MORADOR'},{body:'NÃO'}],'','');
                        this.client.sendMessage(`${ADM_NUMBERS[0]}@c.us`, button);
                        msg.reply("Opa, ja estou verificando com a ADM", msg.author)
                    }

                }
                else if(msg.type === 'vcard'){
                        msg.reply(`Por favor, envie: \n/adicionar [codigo do país][DDD sem zero][número do telefone] --> /adicionar 5511999999999 \n Sem espaços e pontuação no número`)
                } 
                else if(msg.type === 'buttons_response')
                {
                     if(msg.body === 'NÃO') {
                     }
                     else if(msg.body === 'SIM, É MORADOR'){

                        if(msg.hasQuotedMsg){
                            let message = await msg.getQuotedMessage()
                        
                        
                            let number = message.body.replace('É morador? /adicionar','').trim()
                            adicionar(number)
                                
                        }
                        else
                        {
                                msg.reply('não foi possivel adicionar, o contato não esta no whatsapp')
                        }
                    }
                }
                else if(chat.isGroup && chat.id.user === GROUP){
                    // console.log("isGroup")
                    let mentions = await msg.getMentions()
                    // console.log(mentions)

                    if(mentions.some( (item: any) => item.isMe) || msg.body.includes('@logika')){
                    // console.log("comando" + msg.body.replace(`@${BOT_NUMBER}`,'').trim())
                    // console.log("msg.author" + msg.author)
                        let number = msg.body.replace(`@${BOT_NUMBER}`,'');
                        number = normalize(number)
                        console.debug(number);
                        msg.reply(answer(number.trim(), msg.author))
                    }    
                }
                else if (!chat.isGroup && ADM_NUMBERS.includes(contact.number)) {
                    
                        if (msg.body.includes('/enviar')) {
                        // console.log('FORWARDING')
                            if(msg.hasQuotedMsg){
                                let message = await msg.getQuotedMessage()
                                message.forward(`${GROUP}@g.us`)
                            }
                            else
                            {
                                msg.forward(`${GROUP}@g.us`)
                            }

                    }
                }
                else if (!chat.isGroup && !ADM_NUMBERS.includes(contact.number)){
                    console.debug("!chat.isGroup && !ADM_NUMBERS.")
                    
                    if(commongroups.some((group: any) => group.user === GROUP)){
                        console.debug("commongroups")
                        msg.reply(answer(msg.body.replace(`@${BOT_NUMBER}`,'').trim(), msg.author))
                    }
                    else
                    {
                        console.debug("no commongroups")
                        console.debug(msg)
                        msg.reply('Ola, eu sou um BOT, e vejo aqui que você não participa do grupo que eu administro.\n Se você quer ser adicionado ao grupo, *adicione-me aos seu contatos* e responda com */adicionar [codigo do país][DDD][numero]*\n\t exemplo _/adicionar 5511999999999_')

                    }

                }
            }
            catch(error){
                console.error(error)
            }
        });

        this.client.on('group_join', (notification: any) => {
            
            try{
                console.debug("group_join")      
          // User has joined or been added to the group.
                notification.reply(answer('/bemvindo', ''));
             }
            catch(error){
                console.error(error)
            }
        });

        this.client.on('disconnected', (reason: any) => {
            try{
                console.log('Client was logged out', reason);
            }
            catch(error){
                console.error(error)
            }
        });
    }
}