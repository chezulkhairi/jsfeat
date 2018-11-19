// Websocket-Server
var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({host: 'localhost',port: 8000});


wss.on('connection', function(ws) 
{
    var clients = {};

    console.log('client verbunden...');


    ws.on('message', function (data) {
    console.log('von Client empfangen: '+data );
    var obj = JSON.parse(data);

          if("id" in obj) {
            // New client, add it to the id/client object
            clients[obj.id] = obj.id;
            console.log('client: ' + obj.id);
          } 
          else {
            // Send data to the client requested
            clients[obj.to].send(obj.data);
            console.log('send: ' + obj.data);
          }
    })
     /* ws.on('message', function(message) 
    {
        console.log('von Client empfangen: ' + message);
        ws.send('von Server empfangen: ' + message);
    });*/

});
