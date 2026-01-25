const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
const rooms = {};

wss.on("connection", ws => {

  ws.on("message", msg => {
    const data = JSON.parse(msg);

    // JOIN ROOM
    if (data.type === "join") {
      ws.room = data.room;
      rooms[ws.room] = rooms[ws.room] || [];
      rooms[ws.room].push(ws);
      return;
    }

    // RELAY SIGNALS
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room].forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter(c => c !== ws);
    }
  });

});

console.log("✅ Signaling server running on port 8080");
