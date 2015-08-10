var _context,
    _analyserNode;

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
    $myPage = $("html");
    $playlistWindow =  $(".playlistWin");
    $playlistButton = $("#playlistBut");
    $equalizerWindow = $(".equalizerWin");
    $equalizerButton = $("#equalizerBut");
    $("#playBut").on('click', function(){
        console.log("play");
        playSong();
    });
    $("#pauseBut").on('click', function(){
        console.log("pause");
        pauseSong();
    });
    $("#nextBut").on('click', function(){
        next();
    });
    $("#prevBut").on('click', function(){
        prev();
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
    $playlistWindow.click( function(e) {
        e.preventDefault();
        console.log(e.target);
        if ($(e.target).attr('class') === "song") {
            var index = $(e.target).index();//.attr('id').replace('song-', ''), 10);
            selectSong(index);

        }
        else if ($(e.target).attr('class') === "songName") {
            var index = $(e.target).parent().index();//.attr('id').replace('song-', ''), 10);
            selectSong(index);

        }
        else if ( $(e.target).attr('class') ==="fa fa-trash") {
            var index = $(e.target).parent().parent().index();//attr('id').replace('song-', ''), 10);
            deleteSong(index);
        }
        else if ( $(e.target).attr('class') ==="delsongBut") {
            var index = $(e.target).parent().index();//attr('id').replace('song-', ''), 10);
            deleteSong(index);
        }

    });
    $playlistButton.on('click', function(){
        if ($(this).attr('class') === "pressed") {
            $playlistWindow.addClass("closed");
            $(this).removeClass("pressed");
        }
        else  {
            $playlistWindow.removeClass("closed");
            $(this).addClass("pressed");
        }
    });
    $equalizerButton.on('click', function(){
        if ($(this).attr('class') === "pressed") {
            $equalizerWindow.addClass("closed");
            $(this).removeClass("pressed");
        }
        else  {
            $equalizerWindow.removeClass("closed");
            $(this).addClass("pressed");
        }
    });
    $(".closewinBut").on('click', function(){
        var winClass = $(this).closest('div').parent().attr('class');
        console.log(winClass);
        $("." + winClass).addClass("closed");
        if (winClass=="playlistWin") $playlistButton.removeClass("pressed");
        else $equalizerButton.removeClass("pressed");
    });

});

function loadSong(file){
    addtoPlaylist(file);
    console.log("Файл загружен; длина плейлиста =  " + _playList.length);
    if (_playList.length === 1) selectSong(1);
}

function addtoPlaylist(file){
    _playList.push(file);
    document.querySelector(".playlistWin").innerHTML += ('<div class="song" id="song-'+ _playList.length +  '"><div class="songName">' + file.name + '</div> <button class="delsongBut" title="Удалить"><i class="fa fa-trash"></i></button></div>');
}
function selectSong(index){
    $('.song').eq(_playingNumber-1).removeClass("currentSong");
    console.log(index);
    var file = _playList[index-1];
    metaTags(file);
    var src = URL.createObjectURL(file);
    _audio.src =src;
    _playingNumber = index;
    playSong();
    $('.song').eq(index-1).addClass("currentSong");

}
function deleteSong(index){
    if(_playingNumber===index)  stopSong();
    $('.song').eq(index-1).remove();
    _playList.splice(index-1,1);
    if (index<_playingNumber) _playingNumber--;
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
    if(_playingNumber==_playList.length)  selectSong(1);
    else  {
        var number = _playingNumber+1;
        selectSong(number);
    }
}
function prev(){
    if(_playingNumber==1) selectSong(_playList.length);
    else{
        var number = _playingNumber-1;
        selectSong(number);
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
    _analyserNode = _context.createAnalyser();

    filterNode.type = "peaking";
    filterNode.frequency.value = 0;
    filterNode.Q.value = 0;
    filterNode.gain.value = 0;

    gainNode.connect(_analyserNode);
    _analyserNode.connect(_context.destination);
    filterNode.connect(gainNode);
    source.connect(gainNode);
    gainNode.connect(destination);
    source.connect(filterNode);
    specform();

}
function specform(){
    _analyserNode.fftSize = 256;
    var frequencyArray = new Uint8Array(_analyserNode.frequencyBinCount);
    draw();
    function draw () {
        _analyserNode.getByteFrequencyData(frequencyArray);

        var canvas = document.querySelector('canvas');
        // canvas.width = document.querySelector('canvas').offsetWidth ;
        //canvas.height = document.querySelector('canvas').offsetHeight ;
        canvas.width = document.querySelector('#visualZone').offsetWidth ;
        canvas.height = document.querySelector('#visualZone').offsetHeight ;
        var context = canvas.getContext('2d');
        for (var i = 0; i < _analyserNode.frequencyBinCount; i++) {

            var value = frequencyArray[i];
            var percent = value / 256;
            var height = canvas.height * percent;
            var offset = canvas.height - height - 1;
            var barWidth = canvas.width / _analyserNode.frequencyBinCount;
            var hue = i / _analyserNode.frequencyBinCount * 360;
            context.fillStyle = 'rgba(225, 225, 225, 1)';
            context.fillRect(i * barWidth, offset, barWidth, height);
        }

        requestAnimationFrame(draw);
    }
};