const sqlInfo = require('../private/sqlInfo.json')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(sqlInfo.database, sqlInfo.user, sqlInfo.password, {
  host: sqlInfo.host,
  dialect: "mysql"
})
const Interaction = sequelize.define('Interaction', {
    Aid: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    Topic: {type: Sequelize.STRING(60), allowNull: false},
    Link: {type: Sequelize.TEXT, allowNull: false},
    Cid: {type: Sequelize.INTEGER, allowNull: false, references: {model: 'Class', key: 'Cid'}}
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
    Title: {type: Sequelize.TEXT, allowNull: true, defaultValue: null},
    Contents: {type: Sequelize.TEXT, allowNull: true, defaultValue: null},
    Mid: {type: Sequelize.INTEGER, allowNull: false, references: {model: 'Cloud', key: 'Mid'},}
})
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
        cb(interActions[data.name])
    })
    client.on('upload', function(data) {
        if (client.nowRoom)
        {
            // interActions[client.nowRoom].push(data)
            Interactionitems.create({Aid: client.newRoom, Mid: data.Mid, Title: data.title, Contents: data.content})
                .then((value) => {
                    return client.to(client.newRoom).broadcast.emit('upload', data)
                })
                .catch((err) => {
                    console.error(err)
                    return client.emit('errors', "Insert Error")
                })
        }
        else
            return client.emit('errors', "Room Not Connect")
    })
    client.on('deleteAll', function () {
        if (client.nowRoom) {
            Interactionitems.destroy({
                where: {
                    Aid: client.newRoom
                }
            }).then((value) => {
                return client.to(client.nowRoom).emit('deleteAll')
            }).err((err) => {
                return client.emit('errors', 'delete all error')
            })
            // interActions[client.nowRoom] = []
        }
        else
            return client.emit('errors', "Room Not Connect")
    })
}


module.exports = Route