var interActions = {}

/**
 * Socket.io 라우팅
 * @param {SocketIO.Socket} client
 */
function Route(client) {
    console.log('Connect', client.id)
    client.on('join', function(data, cb) {
        client.leaveAll()
        client.join(data.name)
        console.log('join', data.name)
        if (!interActions[data.name])
            interActions[data.name] = []
        client.nowRoom = data.name
        cb(interActions[data.name])
    })
    client.on('upload', function(data) {
        if (client.nowRoom)
        {
            interActions[client.nowRoom].push(data)
            return client.to(client.nowRoom).broadcast.emit('upload', data) 
        }
        else
            return client.emit('errors', "Room Not Connect")
    })
    client.on('deleteAll', function () {
        if (client.nowRoom) {
            client.to(client.nowRoom).emit('deleteAll')
            interActions[client.nowRoom] = []
        }
        else
            return client.emit('errors', "Room Not Connect")
    })
}


module.exports = Route