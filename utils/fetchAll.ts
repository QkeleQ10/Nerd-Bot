import { messages as fetchMessages } from 'discord-fetch-all';

export default (channel: any): any => {
    return new Promise(async resolve => {
        let result = await fetchMessages(channel)
        resolve(result)
    })
}