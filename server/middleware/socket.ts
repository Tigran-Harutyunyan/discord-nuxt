import { Socket, Server } from 'socket.io'

let appSocket = {
    emit: (channel: string, message: string) => {
        console.log('Not initiated yet', channel, message)
    }
}

export default defineEventHandler((event) => {
    event.context.appSocket = appSocket

    if (global.io) return
    const node = event.node
    global.io = new Server(node.res.socket?.server)
    global.io.on('connection', (socket: Socket) => {
        appSocket.emit = (channel, message) => {
            global.io.emit(channel, message)
        }

        socket.on('disconnect', () => {
        });
    })
})