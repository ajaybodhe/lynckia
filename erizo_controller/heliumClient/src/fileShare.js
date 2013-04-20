
/* ---------------------------------------- */
/* file sharing stuff */
/* ---------------------------------------- */
var Helium = Helium || {};

Helium.fileShare = function() {
    // file input 
    var fileElement;

    // create a new stream for file sending
    var fileStream;

    // sf client to transfr file
    var sharefestClient;

    // set file element from user & its onchange event
    this.setFileElement = function(file_el) {
        fileElement = file_el;
        fileElement.onchange = addFiles;
    };

    // set sharefestClient
    /*this.sharefestClient = function (sfClient1) {
        sharefestClient = sfClient1;
    };
*/
   // set fileStream
    this.setFileStream = function (fs) {
        fileStream = fs;
        sharefestClient = new client(fs)
    };
    
    // set private vars
    /*this.setVars = function (fs, file_el) {
        fileStream = fs;

        fileElement = file_el;
        fileElement.onchange = addFiles;

        sharefestClient = new client(fs);
    };*/

    // on receiving data on this stream
    this.onReceiveFileData = function (streamEvent) {
        var data = JSON.parse(streamEvent.msg);
        if (data.name) { // this is metada.
            handleMetaData(data);  
            /*sharefestClient.incomingChunks[streamEvent.stream.getID()] = 0;
            if (0 in sharefestClient.chunks) {
                console.log('got chunk 0');
            } else {
                console.log('requesting chunk 0');
                sharefestClient.requestChunks(streamEvent.stream.getID());
            }*/
        }
        else { // this is real file data
            sharefestClient.receiveChunk(data.originId, data.chunkId, Base64Binary.decode(data.data));
            /*if (!sharefestClient.hasEntireFile && sharefestClient.incomingChunks[data.originId] < sharefestClient.requestThresh) {
                sharefestClient.requestChunks(data.originId);
            }*/
        }
    };

    // When metadata is received on stream
    function handleMetaData (metaData) {
        //stopNonsense();
        updateList(fileElement.files);
        sharefestClient.updateMetadata(metaData);
    };


    function updateList(files) {

//            $('#logo').hide();
        $('#box-text').html(listFiles(files));

        $('.dragdrop').css('opacity', 0.95);
        $('.dragdrop')[0].style.borderStyle = 'solid';
        $('.dragdrop')[0].style.borderWidth = '5px';
//            $('.dragdrop')[0].style.borderColor = '#FFFFFF';

        $('#sharethis').css('opacity', 0.95);
        // AJAY whn do we enable this?
        disableDrag();
        $('.dragdrop')[0].onclick = '';
    }

    // AJAY -Why video was interuppting when data were being read
    function addFiles() {
        var file = fileElement.files[0]; // FileList object
        sharefestClient.prepareToReadFile(file.size);
        var reader = new FileReader();
        var chunkId = 0;
        var chunksPerSlice = 20000;
        var sliceSize = chunksPerSlice*sharefestClient.CHUNK_SIZE;
        var blob;
        $('#box-text').text('reading ' + file.name + '...');
        //startNonsense();

        reader.onloadend = function(evt) {
            if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                sharefestClient.addChunks(evt.target.result);
                chunkId++;
                if((chunkId+1)*sliceSize < file.size){
                    blob = file.slice(chunkId*sliceSize,(chunkId+1)*sliceSize);
                    reader.readAsArrayBuffer(blob);
                }else if(chunkId*sliceSize < file.size){
                    blob = file.slice(chunkId*sliceSize,file.size);
                    reader.readAsArrayBuffer(blob);
                }else{
                    //stopNonsense();
                    updateList(fileElement.files);
                    
                    //TODO: fix for multiple files - use filelist
                    //AJAY - what needs to be fixed? May be run a loop to push metadata of all files.
                    meta0 = {};
                    meta0.numOfChunks = sharefestClient.numOfChunksInFile;
                    meta0.size = fileElement.files[0].size;
                    meta0.name = fileElement.files[0].name;
                    meta0.lastModifiedDate = fileElement.files[0].lastModifiedDate;
                    meta0.type = fileElement.files[0].type;
                    fileStream.sendData(JSON.stringify(meta0));
                    sharefestClient.sendFileData();  
                }
            }
        };

        blob = file.slice(chunkId*sliceSize,(chunkId+1)*sliceSize);
        reader.readAsArrayBuffer(blob);
    }

    function listFiles(files) {
        var str = '';
        for (var i = 0; i < files.length; i++) {
            var entry = files[i];
            str += entry.name + ' (' + bytesToSize(entry.size) + ') ';
        }
        return str;
    }
};
