
const id = process.pid;
console.log(id)

const http = require("http");

let server = http.createServer();
server.listen(50000);


server.on('request', (rq,rs)=>{
    console.log("Richiesta in arrivo: ");
    console.log(rq.query)
    rs.writeHead(200,{'Content-Type': 'text; charset=UTF-8'});
    rs.end('<h1>ciao</h1>');
});

