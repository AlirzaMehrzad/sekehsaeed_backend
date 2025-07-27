require("dotenv").config();

const app = require("./app");
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

app.set("io", io);

server.listen(process.env.APP_PORT || 3333, () => {
	console.log(`Server running on port ${process.env.APP_PORT}`);
});
