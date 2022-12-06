function readCOL() {
    var file = document.querySelector('input[type=file]').files[0];

    var fr = new FileReader();

    fr.addEventListener('load', function () {
    var u = new Uint8Array(this.result),
    a = new Array(u.length),
    i = u.length;
    while (i--) // map to hex
    a[i] = (u[i] < 16 ? '0' : '') + u[i].toString(16);
    u = null; // free memory
    console.log(a); // work with this
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d")
    canvas.height=1;
    canvas.width=a.length/2
    for(var i=0;i<a.length;i+=2){
        console.log(a[i]+''+a[i+1])
        ctx.fillStyle = '#'+bgrToHex(a[i]+''+a[i+1]);
        ctx.fillRect(i/2, 0, 1, 1);
    }
    document.getElementById("output").href = canvas.toDataURL();
    console.log();
    });
    fr.readAsArrayBuffer(file);
}

function bgrToHex(bgrColor) {
    let bgrInt = parseInt(bgrWithEndian(bgrColor, 'big'), 16);
    bgrInt = Math.min(bgrInt, Math.pow(2, 15) - 1); // limit to 15-bit

    let r = (bgrInt & 0b11111) * 8;
    let g = ((bgrInt >>> 5) & 0b11111) * 8;
    let b = ((bgrInt >>> 10) & 0b11111) * 8;
    let rError = Math.floor(r / 32);
    let gError = Math.floor(g / 32);
    let bError = Math.floor(b / 32);

    return (
        (r + rError).toString(16).padStart(2, '0') +
        (g + gError).toString(16).padStart(2, '0') +
        (b + bError).toString(16).padStart(2, '0')
    ).toUpperCase();
}
function bgrWithEndian(bgr, endian) {
    if (endian === 'little') {
        console.log("little endian");
        return bgr;
    } else {
        console.log("big endian");
        return bgr.slice(2, 4) + bgr.slice(0, 2);
    }
}