var io = require('socket.io')()




io.on('connection', require('./socket/room'))

io.listen('3030')