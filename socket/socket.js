module.exports = function(io, rooms) {

  var chatrooms = io.of('/roomlist').on('connection', (socket) => {
    console.log('connection');
    socket.emit('roomupdate', JSON.stringify(rooms));

    socket.on('newroom', (data) => {
      console.log('new room event ' + JSON.stringify(data));
      rooms.push(data);

      socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
      socket.emit('roomupdate', JSON.stringify(rooms));

    })
  })

  var messages = io.of('/messages').on('connection', (socket) => {
    socket.on('joinroom', (data) => {
      socket.username = data.user;
      socket.image = data.image;
      socket.join(data.room);
      console.log("Joined: " + data.user);
      updateUserList(data.room);
      broadcastUserList(data.room);
    });

    socket.on('newmessage', (data) => {
      socket.broadcast.to(data.room).emit('messagefeed', JSON.stringify(data));
    });

    socket.on('updatelist', (data) => {
      updateUserList(data.room);
    });

    function getUserList(room) {
      return io.of('/messages').clients(room).map( (i) => {
        return {user: i.username, image: i.image};
      });
    }

    function broadcastUserList(room) {
      socket.broadcast.to(room).emit('userList', JSON.stringify(getUserList(room)));
    }

    function updateUserList(room) {

      socket.to(room).emit('userList', JSON.stringify(getUserList(room)));

    }
  });
};
