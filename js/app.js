$(document).ready(function () {
    player.init();
});
var player = (function (){
    var context,
        analyserNode,
        gainNode,
        equalizerNodes,
        genre = [
            [5, 4, 3, 1, -1, -1, 0, 2, 3, 4], //rock
            [-2, -1, 0, 1, 3, 3, 1, 0, 1, 2], //pop
            [4, 3, 1, 2, -2, -2, 0, 1, 2, 3], //jazz
            [5, 4, 3, 3, -2, -2, 0, 2, 3, 3], //clas
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]//norm
        ],
        audio = new Audio(),
        playList = [],
        playingNumber,
        playingGenre = 4,
        statusWave,
        title;

    function createContext() {
        try {context = new (window.AudioContext || window.webkitAudioContext);
        }catch (e) {
            alert("Web Audio API не поддерживается в вашем браузере");
        }
        $equalizerWindow.hide();
        $playlistWindow.hide();
        makecontext();
        createListeners();

    }
    
    function initializeElems() {
        $equalizerWindow = $(".equalizerWin");
        $playlistWindow = $(".playlistWin");
        $myPage = $("html");
        $playlistButton = $("#playlistBut");
        $equalizerButton = $("#equalizerBut");
        $timeFiller = $("#timeFiller");
        $timeFull = $("#timeFull");
        $timeCurr = $("#timeCurr");
        $inputZone = $('#inputZone');
        $genre = $('.genre');
        createContext();
    }

    function createListeners() {

        $("#playBut").on('click', function () {
            if ($("#playBut i").attr('class') === "fa fa-pause fa-3x") pauseSong();
            else playSong();
        });
        $("#stopBut").on('click', function () {
            stopSong();
        });
        $("#nextBut").on('click', function () {
            next();
        });
        $("#prevBut").on('click', function () {
            prev();
        });
        //drag'n'drop
        $myPage.on('dragenter', function (e) {
            e.preventDefault();
        }).on('dragleave', function (e) {
            e.preventDefault();
        }).on('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
        }).on('drop', function (e) {
            e.preventDefault();
            var files = e.originalEvent.dataTransfer.files;
            loadSong(files[0]);
        });
        $playlistWindow.click(function (e) {
            e.preventDefault();
            var index;

            if ($(e.target).attr('class') === "song") {
                index = $(e.target).index();
                if (playingNumber != index) selectSong(index);

            }
            else if ($(e.target).attr('class') === "songName") {
                index = $(e.target).parent().index();
                if (playingNumber != index) selectSong(index);

            }
            else if ($(e.target).attr('class') === "fa fa-trash") {
                index = $(e.target).parent().parent().index();
                deleteSong(index);
            }
            else if ($(e.target).attr('class') === "delsongBut") {
                index = $(e.target).parent().index();
                deleteSong(index);
            }

        });
        $playlistButton.on('click', function () {
            $playlistWindow.toggle('show');

        });
        $equalizerButton.on('click', function () {
            $equalizerWindow.toggle('show');
        });
        $(".closewinBut").on('click', function () {
            var winClass = $(this).closest('div').parent().attr('class');
            if (winClass == "playlistWin") $playlistWindow.toggle('show');
            else $equalizerWindow.toggle('show');
        });
        //поменять визуализацию
        //change visualization
        $("#changewaveBut").on('click', function () {
            if (statusWave === "specForm") {
                statusWave = "waveForm";
                waveform();
            }
            else {
                statusWave = "specForm";
                specform();

            }
        });
        //ползунок звука и кнопки
        //volume slider and buttons
        $('#volume').on('change', function () {
            gainNode.gain.value = parseInt(this.value, 10) / 100;
        });
        $('#volumeuptBut').on('click', function () {
            var vol = 50;
            $("#volume").val(vol);
            gainNode.gain.value = parseInt(vol, 10) / 100;
        });
        $('#volumeofftBut').on('click', function () {
            var vol = 0;
            $("#volume").val(vol);
            gainNode.gain.value = parseInt(vol, 10) / 100;
        });
        //ползунки эквалайзера
        //equalizer sliders
        $("input[id^='equalizer-']").on('change', function () {
            var index;
            $('#dropmenuname').text($('#genre-5').text());
            index = parseInt($(this).attr('id').replace('equalizer-', ''), 10);
            equalizerNodes[index].gain.value = parseInt(this.value, 10);
        });
        //меню эквалайзера
        //equalizer menu
        $equalizerWindow.click(function (e) {
            var index;
            e.preventDefault();
            if ($(e.target).attr('class') === "genre") {
                index = $(e.target).index();
                selectGenre(index - 1);

            }
            else if ($(e.target).attr('class') === "genreName") {
                index = $(e.target).parent().index();
                selectGenre(index - 1);

            }
            function selectGenre(index) {
                for (var i = 0; i < 10; i++) {
                    equalizerNodes[i].gain.value = genre[index][i];
                    $("input[id^= " + 'equalizer-' + i + "]").val(genre[index][i]);
                }
                $genre.eq(playingGenre).removeClass("currentGenre");
                $genre.eq(index).addClass("currentGenre");
                playingGenre = index;
            }
        });
        $("#changepictureBut").on('click', changePicture)
        $("#loadsongBut").on('click', function (e) {
            e.preventDefault();
            $inputZone.trigger('click');
        });
        $inputZone.on('change', function (e) {
            var files = e.target.files;
            loadSong(files[0]);
        });
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('ended', next);
    }

    function updateTime() {
        var value = 0,
            textC;
        if (audio.currentTime > 0) {
            value = ((100 / audio.duration) * audio.currentTime).toFixed(2);
        }
        $timeFiller.width(value + "%");
        textC = setTime(audio.currentTime, 1);
        $timeCurr.text(textC);
        function setTime(time, key) {
            var currT = parseInt(time, 10),
                min = parseInt(currT / 60, 10),
                sec = currT % 60,
                minzero = "0",
                seczero = "0";
            if (min === 0 && sec === 0 && key != 0) {
                $timeCurr.show();
                $timeFull.show();
                var textD = setTime(audio.duration, 0);
                $timeFull.text(textD);
            }
            if (min > 9) minzero = "";
            if (sec > 9) seczero = "";
            return minzero + min + ":" + seczero + sec;
        }
    }

    function changePicture() {
        $('#backcover').attr('src', "sources/images/ImageAwesome400(2).jpg");
    }

    function loadSong(file) {
        if (playList.length < 10) {
            addtoPlaylist(file);
            console.log("Файл загружен; длина плейлиста =  " + playList.length);
            if (playList.length === 1) {
                $("#speechZone").hide();
                selectSong(1);
            }
        }
        else alert("Максимальный размер плейлиста.");

    }

    function addtoPlaylist(file) {
        playList.push(file);

        $(".playlistWin").append('<div class="song" id="song-' + playList.length + '"><div class="songName">' + file.name + '</div> <button class="delsongBut" title="Удалить"><i class="fa fa-trash"></i></button></div>');
    }

    function selectSong(index) {
        $('.song').eq(playingNumber - 1).removeClass("currentSong");
        var file = playList[index - 1];
        metaTags(file);
        var src = URL.createObjectURL(file);
        audio.src = src;
        playingNumber = index;
        playSong();
        $('.song').eq(index - 1).addClass("currentSong");

    }

    function deleteSong(index) {
        if (playingNumber === index) {
            stopSong();
            if (playList.length != 1) next();
        }

        $('.song').eq(index - 1).remove();
        playList.splice(index - 1, 1);
        if (index < playingNumber) playingNumber--;
        if (playList.length === 0) cleanScreen();


    }

    function playSong() {
        if (playList.length > 0) {
            audio.play();
            $('#playBut i').removeClass().addClass('fa fa-pause fa-3x');
            $('link[rel$=icon]').remove();
            changeFavicon("sources/images/faviconaPplay.ico");
            setTimeout(
                function () {
                    $(document).prop('title', title || "audioPlayer");
                }, 200)
        }
    }

    function pauseSong() {
        audio.pause();
        $('#playBut i').removeClass().addClass('fa fa-play fa-3x');
        $('link[rel$=icon]').remove();
        changeFavicon("sources/images/faviconaPpause.ico");
    }

    function stopSong() {
        if (playList.length > 0) {
            $(document).prop('title', "audioPlayer");
            pauseSong();
            changeFavicon("sources/images/faviconaP.ico");
            audio.currentTime = 0;
        }
    }

    function changeFavicon(href) {
        $('head').append($('<link rel="shortcut icon" type="image/x-icon"/>').attr('href', href));
    }

    function cleanScreen() {
        changePicture();
        $('#title').text("");
        $('#artist').text("");
        $('#album').text("");
        $("#speechZone").show();
        setTimeout(
            function () {
                $("#timeFull").hide();
                $("#timeCurr").hide();
            }, 200);
        changeFavicon("sources/images/faviconaP.ico");
        $(document).prop('title', "audioPlayer");
    }

    function next() {
        if (playingNumber == playList.length)  selectSong(1);
        else {
            var number = playingNumber + 1;
            selectSong(number);
        }
    }

    function prev() {

        if (playingNumber == 1) selectSong(playList.length);
        else {
            var number = playingNumber - 1;
            selectSong(number);
        }

    }

    function metaTags(file) {
        var src = URL.createObjectURL(file);
        ID3.loadTags(src, function () {
            showTags(src);
        }, {
            tags: ["title", "artist", "album", "picture"],
            dataReader: FileAPIReader(file)
        });
        //метатеги
        function showTags(src) {
            var tags = ID3.getAllTags(src);
            title = tags.title;
            $('#title').text(tags.title || "");
            $('#artist').text(tags.artist || "");
            $('#album').text(tags.album || "");
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
            else {
                $('#backcover').attr('src', "sources/images/ImageAwesome400(2).jpg");
            }
        }
    }

    function makecontext() {
        var frequences = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        var source;
        source = context.createMediaElementSource(audio);
        gainNode = context.createGain();
        //filterNode = context.createBiquadFilter();
        analyserNode = context.createAnalyser();

        // для каждого элемента массива создаем по фильтру
        equalizerNodes = frequences.map(function (frequency) {
            var bFilter = context.createBiquadFilter();

            bFilter.type = 'peaking';
            bFilter.frequency.value = frequency;
            bFilter.Q.value = 0;
            bFilter.gain.value = 0;

            return bFilter;
        });
        source.connect(equalizerNodes[0])
        for (var i = 0; i < 9; i++) {
            equalizerNodes[i].connect(equalizerNodes[i + 1]);
        }
        equalizerNodes[9].connect(analyserNode);

        analyserNode.connect(gainNode);
        gainNode.connect(context.destination);
        statusWave = "specForm";
        specform();

        gainNode.gain.value = 0.1;

    }

    function specform() {


        analyserNode.fftSize = 2048;
        var frequencyArray = new Uint8Array(analyserNode.frequencyBinCount);
        draw();
        function draw() {
            analyserNode.getByteFrequencyData(frequencyArray);
            var canvas = document.querySelector('canvas');
            canvas.width = document.querySelector('#visualZone').offsetWidth;
            canvas.height = document.querySelector('#visualZone').offsetHeight;
            var context = canvas.getContext('2d');
            for (var i = 0; i < analyserNode.frequencyBinCount; i++) {

                var value = frequencyArray[i];
                var percent = value / 248;
                var height = canvas.height * percent;
                var offset = canvas.height - height - 1;
                var barWidth = canvas.width / analyserNode.frequencyBinCount;
                context.fillStyle = 'rgba(225, 225, 225, 1)';
                context.fillRect(i * barWidth, offset, barWidth, height);
            }

            if (statusWave === "specForm") requestAnimationFrame(draw);
        }

    }

    function waveform() {


        function draw() {
            var canvas = document.querySelector('canvas');
            canvas.width = document.querySelector('#visualZone').offsetWidth;
            canvas.height = document.querySelector('#visualZone').offsetHeight;
            var WIDTH = canvas.width;
            var HEIGHT = canvas.height;
            var canvasCtx = canvas.getContext('2d');
            var animationFrame;
            analyserNode.fftSize = 2048;
            var bufferLength = analyserNode.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);
            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);


            if (statusWave === "waveForm") requestAnimationFrame(draw);
            analyserNode.getByteTimeDomainData(dataArray);


            canvasCtx.lineWidth = 1;
            canvasCtx.strokeStyle = 'rgb(255, 255, 255)';

            canvasCtx.beginPath();


            var sliceWidth = WIDTH * 2.0 / bufferLength;
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

    return {
        init: initializeElems
    }
})();

