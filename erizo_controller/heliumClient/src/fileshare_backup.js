
/* ---------------------------------------- */
/* file sharing stuff */
/* ---------------------------------------- */
var Helium = Helium || {};

Helium.fileShare = function() {
    var content = [];
    var moz = !! navigator.mozGetUserMedia
    var lastFileName = ''; /* Direct file blob sharing using Firefox Nightly */
    
    //var files_uploaded = false;

    // getting file from user's system
    var file, fileElement;

    // packet sizes to be sent across
    var packetSize = 1000, textToTransfer = '', packets = 0;    

    // create a new stream for file sending
    var fileStream;

    // when user starts receiving file data save it to disk
    this.onReceiveFileData = function (streamEvent) {
        var data = JSON.parse(streamEvent.msg);
        /* if firefox nightly & file blob shared */
        if (data.size && moz) {
            var reader = new window.FileReader();
            reader.readAsDataURL(data);
            reader.onload = function (event) {
                saveToDisk(event.target.result, lastFileName);
                //quickOutput(lastFileName, 'received successfully!');
    //            disable(false);
            };
            return;
        }

        /* if firefox nightly & file blob shared */
        if (data.lastFileName) {
            lastFileName = data.lastFileName;
            //quickOutput(lastFileName, 'is ready to transfer.');
    //        disable(true);
            return;
        }

        if (data.connected) {
            //quickOutput('Your friend is connected to you.');
            return;
        }

    //    disable(true);

        if (data.packets) packets = parseInt(data.packets);
        //updateStatus();

        content.push(data.message);

        if (data.last) {
            saveToDisk(content.join(''), data.name);
            //quickOutput(data.name, 'received successfully!');
    //        disable(false);
            content = [];
        }
    };

    // set file element from user & its onchange event
    this.setFileElement = function(file_el) {
        fileElement = file_el;
        fileElement.onchange = onFileElementchange;
    };
    
    function onFileElementchange () {
        file = fileElement.files[0];
        if (!file) return false;

        /* if firefox nightly: share file blob directly */
            
        if (moz) {
            sendFileData(JSON.stringify({ lastFileName: file.name }));
            //hangoutUI.send(JSON.stringify({ lastFileName: file.name }));
            //quickOutput(file.name, 'shared successfully!');
            setTimeout(function () {
            if (fileElement) fileElement.value = '';
            }, 0);
            sendFileData(file);
            //return hangoutUI.send(file);
        }
            
        var reader = new window.FileReader();
        reader.readAsDataURL(file);
        reader.onload = onReadAsDataURL;
        //    return disable(true);
    };    

    // set fileStream
    this.setFileStream = function (fs) {
        fileStream = fs;
    };

    function sendFileData (data) {
        fileStream.sendData(data);
    };

    // when uploading of file is done read it & send across
    function onReadAsDataURL (evt, text) {
        var data = {};

        if (evt) {
            text = evt.target.result;
            packets = data.packets = parseInt(text.length / packetSize);
        }

        //updateStatus();

        if (text.length > packetSize) {
            data.message = text.slice(0, packetSize);
            data.first = true;
            data.name = file.name;
        } else {
            data.message = text;
            
            //quickOutput(file.name, 'shared successfully!');

    //        disable(false);
            setTimeout(function () {
                if (fileElement) fileElement.value = '';
            }, 0);
        }
        sendFileData(JSON.stringify(data));
        //hangoutUI.send(JSON.stringify(data));

        textToTransfer = text.slice(data.message.length);

        if (textToTransfer.length)
            setTimeout(function () {
                onReadAsDataURL(null, textToTransfer);
            }, 500);
    };

    // save file to disk
    function saveToDisk (fileUrl, fileName) {
        var save = document.createElement("a");
        save.href = fileUrl;
        save.target = "_blank";
        save.download = fileName || fileUrl;

        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

        save.dispatchEvent(evt);

        window.URL.revokeObjectURL(save.href);
    };

    // UI
    /*
    var outputPanel = document.getElementById('output-panel');
    function quickOutput(message, message2) {
        if (!outputPanel) return;
        if (message2) message = '<strong>' + message + '</strong> ' + message2;

        var tr = document.createElement('tr');
        tr.innerHTML = '<td style="width:80%;">' + message + '</td>';
        outputPanel.insertBefore(tr, outputPanel.firstChild);
    }

    var statusDiv = document.getElementById('status');
    function updateStatus() {
        packets--;
        if (statusDiv) statusDiv.innerHTML = packets + ' items remaining.';
        if (packets <= 0) statusDiv.innerHTML = '';
    }
    */

    // Disable file uploading eleement
    this.disable = function (_disable) {
        if (!fileElement) return;
        if (!_disable) fileElement.removeAttribute('disabled');
        else fileElement.setAttribute('disabled', true);
    };   
};
