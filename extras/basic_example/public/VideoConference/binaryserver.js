var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});

server.listen(9000, function() {
  console.log((new Date()) + " Binary Server is listening on port 9000");
});

var allStreams = [];

// Start Binary.js server
var BinaryServer = require('binaryjs').BinaryServer;
var bs = BinaryServer({server: server});

bs.on('connection',function(client){

	console.log('Client joined');

	client.on('stream',function(stream,meta){
		console.log('Stream created' + stream.id);
		console.log('Stream created writable' + stream.writable);
		console.log('Stream created readable' + stream.readable);
		allStreams.push(stream);

		console.log('Streams array length ' + allStreams.length);
		stream.on('data',function(data){
			console.log(data.length);
			allStreams.forEach(function (sendStream) {
                if (sendStream != stream) {
                  sendStream.write(data);
                }
            });
			//stream.write(data);
		});

	});

	client.on('close',function(){
		var index = null;
		allStreams.forEach(function (sendStream) {
                if (sendStream._closed) {
                	index = allStreams.indexOf(sendStream);
                	console.log('Index of stream ' + index);
                  //sendStream.write(data);
                }
            });
		//console.log('Streams array length before' + allStreams.length);
		allStreams.splice(index,1);
		//console.log('Streams array length after' + allStreams.length);
		console.log('Client closed' + this.id);
	});
});