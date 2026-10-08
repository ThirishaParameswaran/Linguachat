export const registerCalendarSocketHandlers = (io, socket) => {
  socket.on('reminder', (data) => {
    io.emit('reminder', data);
  });

  socket.on('meeting-start', (data) => {
    io.emit('meeting-start', data);
  });

  socket.on('meeting-end', (data) => {
    io.emit('meeting-end', data);
  });
};
