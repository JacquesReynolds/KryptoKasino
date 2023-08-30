const Server = require("./public/js/classes/server");

let server = new Server();
server.startServer(process.env.PORT || 3000)
