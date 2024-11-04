import { io, Socket } from "socket.io-client"

interface socketOptions { 
    'force new connection': boolean,
    reconnectionAttempt: string,
    timeout: number,
    transports : string[],
}

export const initSocket = async() : Promise<Socket> => {
    const options: socketOptions = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    }
    console.log(process.env.REACT_APP_BACKENED_URL);
    return io(process.env.REACT_APP_BACKENED_URL as string, options);
};