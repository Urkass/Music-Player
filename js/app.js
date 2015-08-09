var _context;
$myPage = $("html");
var _audio = new Audio(),
    _playList=[],
    _playingNumber;
//контекст
$(document).ready(function(){
    try {
        _context = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
        alert("Web Audio API is not supported in this browser");
    }
    makingcontext();
});
//кнопки
$(function(){
    $("#playBut").on('click', function(){
        console.log("play");
        playSong();
    });
    $("#pauseBut").on('click', function(){
        console.log("pause");
        pauseSong();
    });

    $myPage.on('dragenter', function (e){
        e.preventDefault();
    });
    $myPage.on('dragleave', function (e){
        e.preventDefault();
    });
    $myPage.on('dragover', function (e){
        e.stopPropagation();
        e.preventDefault();
    });
    $myPage.on('drop', function (e){
        e.preventDefault();
        var files = e.originalEvent.dataTransfer.files;
        loadSong(files[0]);
    });
    $('#inputZone').on('change', function(e) {
        var files = e.target.files;
        loadSong(files[0]);
    }) ;
    $("#playlistWin").click( function(e) {
        e.preventDefault();
        console.log(e.target);
        if ($(e.target).attr('class') === "song") {
            var index = $(e.target).index();//.attr('id').replace('song-', ''), 10);
            selectSong(index);
            playSong();
        }
        else if ($(e.target).attr('class') === "songName") {
            var index = $(e.target).parent().index();//.attr('id').replace('song-', ''), 10);
            selectSong(index);
            playSong();
        }
        else if ( $(e.target).attr('class') ==="fa fa-trash") {
            var index = $(e.target).parent().parent().index();//attr('id').replace('song-', ''), 10);
            deleteSong(index);
            console.log("PIPEC! " + index);

        }
    });

});

function loadSong(file){

    addtoPlaylist(file);
    console.log(_playList.length);
    if (_playList.length === 1) {
        selectSong(0);
        playSong();
    }

}

function addtoPlaylist(file){
    _playList.push(file);
    //document.querySelector("#songs").innerHTML += ('<div class="song" id="song-'+ _playList.length + '"><span class="songName">' + file.name + '</span><a href="#" class="delButton" title="Удалить">--</a></div>');
    document.querySelector("#playlistWin").innerHTML += ('<div class="song" id="song-'+ _playList.length +  '"><div class="songName">' + file.name + '</div> <button class="delsongBut" title="Удалить"><i class="fa fa-trash"></i></button></div>');
}
function selectSong(index){
    console.log(index);
    var file = _playList[index];
    metaTags(file);
    var src = URL.createObjectURL(file);
    _audio.src =src;
    _playingNumber = index;

}
function deleteSong(index){
    if(_playingNumber===index){
        stopSong();
    }
    $('.song:eq('+index+')').remove();
    _playList.splice(index,1);


}
function playSong(){
    _audio.play();


}
function stopSong(){
    _audio.pause();
}
function pauseSong(){
    _audio.pause();
}
function next(){
    if(_playingNumber==_playList.length){
        selectSong(0);
        playSong()
    }
    else{
        selectSong(_playingNumber++);
        playSong();
    }
}
function prev(){
    if(_playingNumber==0){
        selectSong(_playList.length);
        playSong()
    }
    else{
        selectSong(_playingNumber--);
        playSong();
    }
}
function metaTags(file){
    var src = URL.createObjectURL(file);
    ID3.loadTags(src, function() {
        showTags(src);
    }, {
        tags: ["title","artist","album","picture"],
        dataReader: FileAPIReader(file)
    });
    //метатеги
    function showTags(src) {
        console.log(src);
        var tags = ID3.getAllTags(src);
        console.log(tags);
        document.getElementById('title').textContent = tags.title || "";
        document.getElementById('artist').textContent = tags.artist || "";
        document.getElementById('album').textContent = tags.album || "";
        var image = tags.picture;
        if (image) {
            var base64String = "";
            for (var i = 0; i < image.data.length; i++) {
                base64String += String.fromCharCode(image.data[i]);
            }
            var base64 = "data:" + image.format + ";base64," +
                window.btoa(base64String);
            document.getElementById('backcover').setAttribute('src', base64);

        } else {

        }
    }
}


function makingcontext(){

    var source,
        filterNode,
        gainNode,
        destination;
    source = _context.createMediaElementSource(_audio);
    gainNode  = _context.createGain();
    filterNode = _context.createBiquadFilter();
    destination = _context.destination;

    filterNode.type = "lowpass";
    filterNode.frequency.value = 10000;
    filterNode.Q.value = 0;
    filterNode.gain.value = 0;

    filterNode.connect(gainNode);
    source.connect(gainNode);
    gainNode.connect(destination);
    source.connect(filterNode);


}