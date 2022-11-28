import {
    MENSAGERIA,
    PORTARIA,
    GERENTE,
    SINDICO,
    APP,
    INDICACOES,
    GRUPOS,
    DOC_PLANTAS,
    DOC_RI,
    DOC_CONVENCAO} from './resource'
const BOT = `
❓ */?* - exibe esta lista de comandos
📕 */docregimento* - link para o Regimento Interno
📗 */docconvencao* - link para a convenção
📘 */docplantas* - link para arquivos de plantas
📨 */mensageria* - contato da mensageria
🛎️ */portaria* - contato da portaria
👩‍💼 */gerente* - contato da gerente
📱 */app* - link para o app do condomínio
👥 */grupos* - lista com os demais grupos
 \n\n EXEMPLO: @logika /?`
// 👨‍💼 */sindico* - contato do sindico
//👍 */indicações* - planilha com indicações de serviços
const BEMVINDO = `Boas vindas!\n\nEu não sou um bot muito inteligente, mas consigo  auxiliar com algumas coisas. Quando precisar, mande uma mensagem mencionando a mim com um dos comandos especiais listados abaixo. \n\n ${BOT}`

export const answer = (command: string, from: string) => {
    console.log(command)
    switch (command)
    {
        case "/bemvindo":
            return 
        case '/?':
            return BOT
        case '/mensageria':
            return MENSAGERIA
        case '/portaria':
            return PORTARIA
        case '/gerente':
            return GERENTE
        case '/sindico':
            return SINDICO
        case '/app':
            return APP
        case '/indicações':
            return INDICACOES
        case '/grupos':
            return GRUPOS
        case '/docplantas':
            return DOC_PLANTAS
        case '/docconvencao':
            return DOC_CONVENCAO
        case '/docregimento':
            return DOC_RI
        default:
            return 'Estoy confuso'
    }
}