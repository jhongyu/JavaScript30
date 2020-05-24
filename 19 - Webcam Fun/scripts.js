const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((localMediaStream) => {
            // console.log(localMediaStream);
            video.srcObject = localMediaStream;
            video.play();
        })
        .catch((err) => {
            console.error(err);
        });
}

function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        let pixes = ctx.getImageData(0, 0, width, height);
        // console.log(pixes);
        // debugger;

        // pixes = redEffect(pixes);
        // pixes = rgbSplit(pixes);
        pixes = greenScreen(pixes);
        ctx.putImageData(pixes, 0, 0);
    }, 16);
}

function redEffect(pixes) {
    for (let i = 0; i < pixes.data.length; i += 4) {
        pixes.data[i + 0] += 100;
        pixes.data[i + 1] -= 50;
        pixes.data[i + 2] *= 0.5;
    }
    return pixes;
}

function rgbSplit(pixes) {
    for (let i = 0; i < pixes.data.length; i += 4) {
        pixes.data[i - 150] = pixes.data[i + 0];
        pixes.data[i + 100] = pixes.data[i + 1];
        pixes.data[i - 150] = pixes.data[i + 2];
    }
    return pixes;
}

function greenScreen(pixes) {
    const levels = {};

    document.querySelectorAll('.rgb input').forEach((input) => {
        levels[input.name] = input.value;
    });

    for (let i = 0; i < pixes.data.length; i += 4) {
        let red = pixes.data[i + 0];
        let green = pixes.data[i + 1];
        let blue = pixes.data[i + 2];
        let alpha = pixes.data[i + 3];

        if (
            red >= levels.rmin &&
            green >= levels.gmin &&
            blue >= levels.bmin &&
            red <= levels.rmax &&
            green <= levels.gmax &&
            blue <= levels.bmax
        ) {
            pixes.data[i + 3] = 0;
        }
    }

    return pixes;
}

function takePhoto() {
    snap.currentTime = 0;
    snap.play();

    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'awesome');
    // link.textContent = 'Download Image';
    link.innerHTML = `<img src="${data}" alt="awesome" />`;
    strip.insertBefore(link, strip.firstChild);
}

getVideo();

video.addEventListener('canplay', paintToCanvas);
