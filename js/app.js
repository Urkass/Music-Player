var _context,
    _analyserNode,
    _gainNode,
    _equalizerNodes;
var _genre = [
    [5 ,4, 3, 1, -1, -1, 0, 2, 3, 4], //rock
    [-2, -1, 0, 1, 3, 3, 1, 0, 1, 2], //pop
    [4, 3, 1, 2, -2, -2, 0, 1, 2, 3], //jazz
    [5, 4, 3, 3, -2, -2, 0, 2, 3, 3], //clas
    [0,0,0,0,0,0,0,0,0,0]//norm
];
var _audio = new Audio(),
    _playList=[],
    _playingNumber,
    _playingGenre;
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
    $('#loadsongBut').on('click', function(e) {
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
    //закрыть окно
    $(".closewinBut").on('click', function(){
        console.log("Закрыть!");
        var winClass = $(this).closest('div').parent().attr('class');
        console.log(winClass);
        $("." + winClass).addClass("closed");
        if (winClass=="playlistWin") $playlistButton.removeClass("pressed");
        else $equalizerButton.removeClass("pressed");
    });
    //поменять визуализацию
    $("#changewaveBut").on('click', function(){
        if ($(this).attr('class') === "spec"){
            $(this).removeClass("spec");
            $(this).addClass("wave");
            waveform();
        }
        else{
            $(this).removeClass("wave");
            $(this).addClass("spec");
            specform();
        }
    });
    //ползунок звука
    $('#volume').on('change', function() {
        _gainNode.gain.value = parseInt(this.value, 10) / 100;
        console.log(_gainNode.gain.value);
    });

    //ползунки эквалайзера
    $("input[id^='equalizer-']").on('change', function () {
        var index;
        $('#dropmenuname').text($('#genre-5').text());
        index = parseInt($(this).attr('id').replace('equalizer-', ''), 10);
        _equalizerNodes[index].gain.value = 4 * parseInt(this.value, 10);
        console.log(index + '; ' + parseInt(this.value, 10) + '; ' + this.value );
    });
    //дроп меню эквалайзера
    /*$("#equalizer-menu div[id^='genre-']").click( function () {
        var index;
        index = parseInt($(this).attr('id').replace('genre-', ''), 10);
        for (var i=0; i<10; i++){
            _equalizerNodes[i].gain.value = 4* _genre[index][i];
            $("input[id^= "+ 'equalizer-' + i +"]").val(_genre[index][i]);
        }
        $('.song').eq(_playingGenre).removeClass("currentGenre");
        $('.song').eq(index).removeClass("currentGenre");
        _playingGenre = index;

    });*/
    $equalizerWindow.click( function(e) {
        var index;
        e.preventDefault();
        console.log(e.target);
        if ($(e.target).attr('class') === "genre") {
            console.log("попал в жанр");
            index = $(e.target).index();
            selectGenre(index-1);

        }
        else if ($(e.target).attr('class') === "genreName") {
            index = $(e.target).parent().index();
            selectGenre(index-1);

        }
        console.log(index);
        function selectGenre(index){
            console.log("ф-ц");
            for (var i=0; i<10; i++){
                _equalizerNodes[i].gain.value = 4* _genre[index][i];
                $("input[id^= "+ 'equalizer-' + i +"]").val(_genre[index][i]);
            }
            $('.genre').eq(_playingGenre).removeClass("currentGenre");
            $('.genre').eq(index).addClass("currentGenre");
            _playingGenre = index;
        }
    });
    $("#changepictureBut").on('click', function(){
        $('#backcover').attr('src', "sources/images/ImageAwesome400(2).jpg");
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
        $('#title').text(tags.title || "");
        $('#artist').text(tags.artist || "");
        $('#album').text( tags.album || "");
        var image = tags.picture;
        if (image) {
            var base64String = "";
            for (var i = 0; i < image.data.length; i++) {
                base64String += String.fromCharCode(image.data[i]);
            }
            var base64 = "data:" + image.format + ";base64," +
                window.btoa(base64String);
            $('#backcover').attr('src', base64);
        }
        else{
            $('#backcover').attr('src', "sources/images/ImageAwesome400(2).jpg");
        }
    }
}


function makingcontext(){
    var frequences = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    var source,
        filterNode,
        destination;
    source = _context.createMediaElementSource(_audio);
    _gainNode  = _context.createGain();
    filterNode = _context.createBiquadFilter();
    _analyserNode = _context.createAnalyser();


    destination = _context.destination;


    filterNode.type = "peaking";
    filterNode.frequency.value = 0;
    filterNode.Q.value = 0;
    filterNode.gain.value = 0;
    // для каждого элемента массива создаем по фильтру
    _equalizerNodes = frequences.map( function(frequency){
        var bFilter = _context.createBiquadFilter();

        bFilter.type = 'peaking';
        bFilter.frequency.value = frequency;
        bFilter.Q.value = 2;
        bFilter.gain.value = 0;

        return bFilter;
    });
    

   ;
    _gainNode.connect(_analyserNode);
    _analyserNode.connect(_context.destination);
    filterNode.connect(_gainNode);


    _equalizerNodes[0].connect(_equalizerNodes[1]);
    _equalizerNodes[1].connect(_equalizerNodes[2]);
    _equalizerNodes[2].connect(_equalizerNodes[3]);
    _equalizerNodes[3].connect(_equalizerNodes[4]);
    _equalizerNodes[4].connect(_equalizerNodes[5]);
    _equalizerNodes[5].connect(_equalizerNodes[6]);
    _equalizerNodes[6].connect(_equalizerNodes[7]);
    _equalizerNodes[7].connect(_equalizerNodes[8]);
    _equalizerNodes[8].connect(_equalizerNodes[9]);
    _equalizerNodes[9].connect(_gainNode);

    source.connect(_equalizerNodes[0])
    source.connect(_gainNode);
    _gainNode.connect(destination);
    source.connect(filterNode);
    specform();
    _gainNode.gain.value =0.1;

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
function waveform() {


    function draw() {
        var canvas = document.querySelector('canvas');
        canvas.width = document.querySelector('#visualZone').offsetWidth ;
        canvas.height = document.querySelector('#visualZone').offsetHeight ;
        var WIDTH = canvas.width;
        var HEIGHT = canvas.height;
        var canvasCtx = canvas.getContext('2d');
        var animationFrame;
        _analyserNode.fftSize = 256;
        var bufferLength = _analyserNode.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);


        requestAnimationFrame(draw);
        _analyserNode.getByteTimeDomainData(dataArray);


        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(255, 255, 255)';

        canvasCtx.beginPath();


        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 128.0;
            var y = v * HEIGHT / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();

    }

    draw();
}