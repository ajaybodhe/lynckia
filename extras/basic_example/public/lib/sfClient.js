(function () {
    //client = function (wsServerUrl) {
    client = function (fs) {
        // AJAY - clientid should be set starting from 0,1,2,3....
        this.clientId = fs.getID();
        
        //this.peerConnections = {};
        
        this.requestThresh; //how many chunk till new request
        this.numOfChunksToAllocate;
        this.maxNumOfChunksToAllocate;
        this.configureBrowserSpecific();
        this.CHUNK_SIZE;//bytes
        this.CHUNK_EXPIRATION_TIMEOUT = 2000;
        
        //this.peerConnectionImpl;
        //this.dataChannels = {};
        //this.initiateClient(`);
        
        //this.registerEvents();
        this.chunks = {};// <id, arrybuffer>
        this.chunkRead = 0;
        this.numOfChunksInFile;
        this.BW_INTERVAL = 500;
        this.lastCycleTime = Date.now();
        this.numOfChunksReceived = 0;
        this.hasEntireFile = false;
        //this.incomingChunks = {}; //<peerId , numOfChunks>
        //this.missingChunks = [];
        //this.pendingChunks = [];
        this.lastCycleUpdateSizeInBytes = 0;
        this.firstTime = true;
        this.startTime;
        this.totalAvarageBw;
        this.fileStream = fs;
        this.metadata;
    };

    client.prototype = {
        configureBrowserSpecific:function () {
            if (window.mozRTCPeerConnection) {
                this.requestThresh = 70; //how many chunk till new request
                this.numOfChunksToAllocate = 95;
                this.maxNumOfChunksToAllocate = 200;
                this.CHUNK_SIZE = 50000;
            } else if (window.webkitRTCPeerConnection) {
                this.requestThresh = 70; //how many chunk till new request
                this.numOfChunksToAllocate = 95;
                this.maxNumOfChunksToAllocate = 99;
                this.CHUNK_SIZE = 800;
            }
        },

        updateMetadata:function (metadata) {
            this.metadata = metadata;
            this.numOfChunksInFile = metadata.numOfChunks;
            /*for (var i = 0; i < this.numOfChunksInFile; ++i)
                this.missingChunks[i] = 1;*/
        },

        chunkFile:function (binaryFile) {
            this.numOfChunksInFile = Math.ceil(binaryFile.byteLength / this.CHUNK_SIZE)
            for (var i = 0; i < this.numOfChunksInFile; i++) {
                var start = i * this.CHUNK_SIZE;
                this.chunks[i] = binaryFile.slice(start, start + this.CHUNK_SIZE);
            }
        },

        addChunk:function(i,binaryChunk){
            this.chunks[i] = binaryChunk;
        },

        addChunks:function(binarySlice){
            this.numOfChunksInSlice = Math.ceil(binarySlice.byteLength / this.CHUNK_SIZE);
            for (var i = 0; i < this.numOfChunksInSlice; i++) {
                var start = i * this.CHUNK_SIZE;
                this.chunks[this.chunkRead] = binarySlice.slice(start,Math.min(start + this.CHUNK_SIZE,binarySlice.byteLength));
                this.chunkRead++;
            }
            if(this.chunkRead == this.numOfChunksInFile){
                this.hasEntireFile = true;
            }
        },

        prepareToReadFile:function(fileSize){
            this.numOfChunksInFile = Math.ceil(fileSize / this.CHUNK_SIZE);
        },

        addFile:function (body) {
            this.chunkFile(body);
            this.hasEntireFile = true;
        },

        receiveChunk:function (originId, chunkId, chunkData) {
            /*if (this.pendingChunks.hasOwnProperty(chunkId)) {
                delete this.pendingChunks[chunkId];
                this.incomingChunks[originId]--;
            }*/
            if (!this.chunks.hasOwnProperty(chunkId)) {
                this.numOfChunksReceived++;
                this.chunks[chunkId] = chunkData;
                this.updateProgress();
                this.checkHasEntireFile();
            }
        },

        updateProgress:function () {
            if (this.firstTime) {
                this.startTime = Date.now();
                this.firstTime = false;
            }
            var percentage = this.numOfChunksReceived / this.numOfChunksInFile;
            var currentProgressUpdateSizeInSize = this.numOfChunksReceived * this.CHUNK_SIZE; //in bytes
            var rate;

            var currentTime = Date.now();
            var cycleDuration = currentTime - this.lastCycleTime;
            var cycleSize = this.numOfChunksReceived * this.CHUNK_SIZE - this.lastCycleUpdateSizeInBytes

            if (cycleDuration > this.BW_INTERVAL) {
                rate = this.calcBwInKbps(cycleDuration / 1000, cycleSize);
                this.lastCycleTime = currentTime
                this.lastCycleUpdateSizeInBytes = this.numOfChunksReceived * this.CHUNK_SIZE;
            }

            if (this.numOfChunksReceived == this.numOfChunksInFile) {
                this.totalAvarageBw = this.calcBwInKbps((currentTime - this.startTime) / 1000, this.numOfChunksInFile * this.CHUNK_SIZE)
            }

            /*if(this.numOfChunksReceived*this.CHUNK_SIZE - this.lastProgressUpdateSizeInSize > 50000){
             rate = this.calcBwInKbps()
             }*/

            this.displayDownloadProgress(percentage * 100, rate, this.totalAvarageBw);
        },

        displayDownloadProgress : function(percent, bw, totalBW) {
            var prog = document.getElementById('progress');
            var progDiv = document.getElementById('progressbar');
            var per = document.getElementById('percent');
            var rateDiv = document.getElementById('rate');
            var bwPresenter = document.getElementById('bandwidthPresenter');
            if (bw) {
                if (bw >= 1024) {
                    rateDiv.textContent = (((bw / 1024).toFixed(1))).toString() + 'MB/s';
                } else {
                    rateDiv.textContent = (((bw).toFixed(1))).toString() + 'KB/s';
                }
            }

            if (prog.hidden) {
                prog.hidden = false;
                progDiv.hidden = false;
            }

            prog.value = percent;
            per.textContent = Math.floor(percent.toString()) + '%';

            // only in the end
            if (totalBW) {
                prog.hidden = true;
                per.textContent = 'was downloaded at ';

                bwPresenter.textContent = '';
                if (totalBW >= 1024) {
                    per.textContent += (((totalBW / 1024).toFixed(1))).toString() + 'MB/s';
                } else {
                    per.textContent += (((totalBW).toFixed(1))).toString() + 'KB/s';
                }

                rate.textContent = '';
  //              this.showLink();
                //$('#secondDesc').html('Thank you for Sharefesting!<p>Please stay and help sharing </p>');
            }
        },
/*
        showLink:function () {
            $('#shareURLBox').show();
            $('#shareURLBox').text(document.location.href);
            $('#shareURLBox')[0].href = document.location.href;
        },
*/
        // AJAY Make this async
        sendFileData:function() {
            for (var i = 0; i < this.numOfChunksInFile; ++i) {
//              console.log("received NEED_CHUNK command " + chunkId);
                this.fileStream.sendData(proto64.send(this.clientId, 1, 1, i, Base64Binary.encode(this.chunks[i])));
            }
        },

        calcBwInKbps:function (timeInSec, sizeInBytes) {
            return (sizeInBytes / 1024) / timeInSec;
        },

        /*addToPendingChunks:function (chunksIds, peerId) {
            if (chunksIds.length == 0) return;
            var id = setTimeout(this.expireChunks, this.CHUNK_EXPIRATION_TIMEOUT, chunksIds, peerId);
//            console.log(id);
        },

        requestChunks:function (targetId) {
            var chunkIds = [];
            var tempChunks = 0;
            for (var chunkId in this.missingChunks) {
                chunkIds.push(chunkId);
                delete this.missingChunks[chunkId];
                this.pendingChunks[chunkId] = 1;
                tempChunks++;
                if (tempChunks >= this.numOfChunksToAllocate)
                    break;
            }
            this.incomingChunks[targetId] += chunkIds.length;
            this.addToPendingChunks(chunkIds, targetId);
            //AJAy - THis is ack
            //fileStream.sendData(proto64.need(this.clientId, 1, 1, chunkIds));
        },*/

        checkHasEntireFile:function () {
            if (this.numOfChunksReceived == this.numOfChunksInFile) {
                //ToDo: anounce has file base64.decode the strings and open it
                console.log("I have the entire file");
                this.hasEntireFile = true;
                //this.ws.sendDownloadCompleted();
                this.saveFileLocally();
            }
        },

        saveFileLocally:function () {
            var array = new Uint8Array((this.numOfChunksInFile-1)*this.CHUNK_SIZE+this.chunks[this.numOfChunksInFile-1].byteLength);
            for (var i = 0; i < this.numOfChunksInFile; ++i) {
                array.set(this.chunks[i], i*this.CHUNK_SIZE);
            }
            var blob = new Blob([array]);
            saveLocally(blob, this.metadata.name);
        },
/*
        registerEvents:function () {
            var thi$ = this;*/
            /**
             * remove pending chunks from the pending and add back to the missing
             * @param chunksIds that might still be pending
             *//*
            this.expireChunks = function (chunksIds, peerId) {
                var expire = 0;
                for (var i = 0; i < chunksIds.length; i++) {
                    var chunkId = chunksIds[i];
                    if (chunkId in thi$.pendingChunks) {
                        expire++;
//                        console.log('expiring chunk ' + chunkId);
                        // let's expire this chunk
                        delete thi$.pendingChunks[chunkId];
                        thi$.missingChunks[chunkId] = 2;
                        thi$.incomingChunks[peerId]--;
                    }
                }
                //flow-control: currently this mechanism isn't very effective
                if(expire){
                    console.log("Expired " + expire + " chunks");
//                    console.log("numOfChunksToAllocate: " + thi$.numOfChunksToAllocate);
                    thi$.numOfChunksToAllocate = Math.floor(thi$.numOfChunksToAllocate/1.3);
                }else if(thi$.numOfChunksToAllocate < thi$.maxNumOfChunksToAllocate){
                    thi$.numOfChunksToAllocate++;
                }
//                console.log(thi$.numOfChunksToAllocate);
                if (thi$.incomingChunks[peerId] < thi$.requestThresh) {
                    thi$.requestChunks(peerId);
                }

            };

            //PeerConnection events
            
            radio('commandArrived').subscribe([function (msg) {
                var cmd = proto64.decode(msg.data);
                if (cmd.op == proto64.NEED_CHUNK) {
                    for (var i = 0; i < cmd.chunkId.length; ++i) {
                        var chunkId = cmd.chunkId[i];
//                        console.log("received NEED_CHUNK command " + chunkId);
                        if (chunkId in this.chunks) {
                            fileStream.sendData(proto64.send(this.clientId, 1, 1, chunkId, Base64Binary.encode(this.chunks[chunkId])));
                        } else {
                            console.warn('I dont have this chunk' + chunkId);
                        }
                    }
                } else if (cmd.op == proto64.DATA_TAG) {
//                    console.log("received DATA_TAG command with chunk id " + cmd.chunkId);
                    this.receiveChunk(cmd.originId, cmd.chunkId, Base64Binary.decode(cmd.data));
                    if (!this.hasEntireFile && this.incomingChunks[cmd.originId] < this.requestThresh) {
                        this.requestChunks(cmd.originId);
                    }
                } else if (cmd.op == proto64.MESSAGE) {
                    console.log("peer " + cmd.originId + " sais: " + cmd.data);
                }
            }, this]);
            
            radio('connectionReady').subscribe([function (targetId) {
                this.incomingChunks[targetId] = 0;
                if (0 in this.chunks) {
                    console.log('got chunk 0');
                } else {
                    console.log('requesting chunk 0');
                    this.requestChunks(targetId);
                }
            }, this]);
            

        }*/
    };
})();
