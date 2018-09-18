/**
 * Socket.io 라우팅
 * @param {SocketIO.Socket} client
 */
function Route(client) {
    console.log('Connect', client.id)
    client.on('join', function(data) {
        client.leaveAll()
        client.join(data.name)
        client.nowRoom = data.name
    })
    client.on('upload', function(data) {
        if (client.nowRoom)
            return client.to(client.nowRoom).broadcast.emit('upload', data) 
       else
            return client.emit('errors', "Room Not Connect")
    })
}


module.exports = Route