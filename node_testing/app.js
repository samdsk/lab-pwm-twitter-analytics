const http = require("http");

let server = http.createServer();
server.listen(50000);

console.log(server);

server.on('request', (rq,rs)=>{
    console.log("Richiesta in arrivo: ");
    rs.writeHead(200,{'Content-Type': 'text; charset=UTF-8'});
    rs.end('prova!');
});