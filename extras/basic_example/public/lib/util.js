//$(document).ready(function () {
//window.onload  = function() {
//    document.querySelector('input[type="file"]').addEventListener('change', function (e) {
//        var blob = this.files[0];
//
//        const BYTES_PER_CHUNK = 1024 * 1024 * 1024; // 1GB chunk sizes.
//        const SIZE = blob.size;
//
//        var start = 0;
//        var end = BYTES_PER_CHUNK;
//
//        while (start < SIZE) {
//            upload(blob.slice(start, end));
//
//            start = end;
//            end = start + BYTES_PER_CHUNK;
//        }
//    }, false);
//};
var DICTIONARY = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('');

function generateID(seed) {
    /* Given a seed, this function will return a 'shortened' URL */
    if (typeof(seed) === 'undefined') seed = new Date().getTime();
    return encode(seed);
}

function getSeedFromID(id) {
    /* Given a 'shortened' URL, it will return the seed */
    if (typeof(seed) === 'undefined') return -1;
    return decode(id);
}

function encode(i) {
    /* Generates a 'shortened' URL */
    if (i == 0) return DICTIONARY[0];

    var result = '';
    var base = DICTIONARY.length;

    while (i > 0) {
        result += DICTIONARY[i % base];
        i = Math.floor(i / base);
    }

    return result;
}

function decode(i) {
    /* Returns the original input from a 'shortened' URL */
    var i = 0;
    var base = DICTIONARY.length;

    input.split("").forEach(function (c) {
        i = i * base + DICTIONARY.indexOf(c);
    });

    return i;
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function getRandomK(array, k) {
    var shuffled = shuffle(array);
    return shuffled.slice(0, k);
};
function shuffle(array) {
    var tmp, current, top = array.length;

    if (top) while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    return array;
}

function upload(blob) {
    console.log('sending blob ' + blob.size);
    if(user == 1) {
        dc1.send(blob);
    } else {
        dc2.send(blob);
    }
}

function saveLocally(blob, name) {
    if (!window.URL && window.webkitURL)
        window.URL = window.webkitURL;
    var a = document.createElement('a');
    a.download = name;
    a.setAttribute('href', window.URL.createObjectURL(blob));
    document.body.appendChild(a);
    a.click();
}

function bytesToSize(bytes) {
    var sizes = ['b', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i)) + '' + sizes[i];
};