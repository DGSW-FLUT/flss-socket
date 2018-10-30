const sqlInfo = require('../private/sqlInfo.json')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(sqlInfo.database, sqlInfo.user, sqlInfo.password, {
  host: sqlInfo.host,
  dialect: "mysql"
})
/*
+----------+---------+------+-----+---------+----------------+
| Field    | Type    | Null | Key | Default | Extra          |
+----------+---------+------+-----+---------+----------------+
| Iid      | int(11) | NO   | PRI | NULL    | auto_increment |
| Aid      | int(11) | NO   | MUL | NULL    |                |
| Title    | text    | YES  |     | NULL    |                |
| Contents | text    | YES  |     | NULL    |                |
| Mid      | int(11) | NO   | MUL | NULL    |                |
+----------+---------+------+-----+---------+----------------+
 */
const Interactionitems = sequelize.define('InteractionItems', {
    Iid: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    Aid: {type: Sequelize.INTEGER, references: {model: 'Interaction', key: 'Aid'}},
    Topic: {type: Sequelize.TEXT, allowNull: true, defaultValue: null},
    Content: {type: Sequelize.TEXT, allowNull: true, defaultValue: null},
    file: {type: Sequelize.TEXT, allowNull: true, defaultValue: null},
    Link: {type: Sequelize.TEXT, allowNull: true ,defaultValue: null} 
    }, {
        timestamps: false
    }
)
// Interactionitems.belongsTo(Interaction, {foreignKey: 'Aid', targetKey: 'Aid'})
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
        // cb(interActions[data.name])
        Interactionitems.findAll({
            where: {
                Aid: data.name
            }
        })
            .then((res) => {
                cb(res)    
            })
    })
    client.on('upload', function(data) {
        if (client.nowRoom)
        {
            console.log(data)
            // interActions[client.nowRoom].push(data)
            Interactionitems.create({Aid: client.nowRoom, file: data.file, Topic: data.Topic, Content: data.Content, Link: data.Link})
                .then((value) => {
                    return client.to(client.nowRoom).broadcast.emit('upload', data)
                })
                .catch((err) => {
                    console.error(err)
                    return client.emit('errors', "Insert Error")
                })
        }
        else
            return client.emit('errors', "Room Not Connect")
    })
    client.on('delete', function(data, cb) {
        if (client.nowRoom) {
            console.log(data)
            Interactionitems.destroy({where: { Iid: data } })
                .then((value) => {
                    client.to(client.nowRoom).broadcast.emit('delete', data)
                    return cb({success: true})
                })
                .catch((err) => console.error(err))

        }
        else
            return client.emit('errors', "Room Not Connect")
    })
    client.on('deleteAll', function () {
        if (client.nowRoom) {
            Interactionitems.destroy({
                where: {
                    Aid: client.nowRoom
                }
            }).then((value) => {
                return client.to(client.nowRoom).emit('deleteAll')
            }).catch((err) => {
                return client.emit('errors', 'delete all error')
            })
            // interActions[client.nowRoom] = []
        }
        else
            return client.emit('errors', "Room Not Connect")
    })
}


module.exports = Route