var serverUrl = "/";
var localStream, room;

    function sendChat(){
            var inputBox = document.getElementById("chat_input");
            var textBox = document.getElementById("chat_history");
            var date = new Date();
            
            var message = '[' + date.toLocaleTimeString() + '] ' + localStream.getID() + ' : ' + inputBox.value;
            textBox.value = textBox.value + "\n" + message;

            localStream.sendData({text:inputBox.value});
            inputBox.value = "";
        };


window.onload = function () {

		localStream = Erizo.Stream({audio: true, video: true, data: true});

        
    var createToken = function(userName, role, callback) {

        var req = new XMLHttpRequest();
        var url = serverUrl + 'createToken/';
        var body = {username: userName, role: role};

        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                callback(req.responseText);
            }
        };

        req.open('POST', url, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(body));
    };

    createToken("user", "role", function (response) {
        var token = response;
        console.log(token);
        room = Erizo.Room({token: token});

        var receiveStreamData = function(streamEvent){
            var textBox = document.getElementById("chat_history");
            console.log("Chat received : " + streamEvent.msg.text);
            var date = new Date();
           var message = '[' + date.toLocaleTimeString() + '] ' + streamEvent.stream.getID() + ' : ' + streamEvent.msg.text;

            textBox.value = textBox.value + "\n" + message;

        };

        localStream.addEventListener("access-accepted", function () {
            
            var subscribeToStreams = function (streams) {
                for (var index in streams) {
                    var stream = streams[index];
                    if (localStream.getID() !== stream.getID()) {
                        stream.addEventListener("stream-data",receiveStreamData);
                        room.subscribe(stream);
                    } 
                }
            };

            room.addEventListener("room-connected", function (roomEvent) {

                room.publish(localStream);
                subscribeToStreams(roomEvent.streams);
            });

            room.addEventListener("stream-subscribed", function(streamEvent) {
                var stream = streamEvent.stream;
                var div = document.createElement('div');
                div.setAttribute("style", "width: 320px; height: 240px;");
                div.setAttribute("id", "test" + stream.getID());
                document.getElementById("videoTags").appendChild(div);
//                document.body.appendChild(div);
                stream.show("test" + stream.getID());

            });

            room.addEventListener("stream-added", function (streamEvent) {
                var streams = [];
                streams.push(streamEvent.stream);
                subscribeToStreams(streams);
            });

            room.addEventListener("stream-removed", function (streamEvent) {
                // Remove stream from DOM
                var stream = streamEvent.stream;
                if (stream.elementID !== undefined) {
                    var element = document.getElementById(stream.elementID);
                    document.body.removeChild(element);
                }
            });

            room.connect();

            localStream.show("myVideo");

        });
        localStream.init();
    });   
};