export const registerDebtSocketHandlers = (io, socket) => {
  socket.on('debt-update', (data) => {
    io.emit('debt-update', data);
  });

  socket.on('debt-alert', (data) => {
    io.emit('debt-alert', data);
  });

  socket.on('remediation-required', (data) => {
    io.emit('remediation-required', data);
  });
};
