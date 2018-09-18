/**
 * Socket.io 라우팅
 * @param {SocketIO.Socket} client
 */
function Route(client) {
    client.on('join', function(data) {
        client.leaveAll()
        client.join(data.name)
    })
    client.on('upload', function(data) {
        client.to(client.rooms[0]).broadcast.emit(data)
    })
}


module.exports = Route