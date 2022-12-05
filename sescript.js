var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

let zoom = 100;
let viewpos = [0,0]


function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(viewpos[0], viewpos[1], zoom, zoom);
}

function setNav(){
    viewpos[0] = document.getElementById('xp').value;
    viewpos[1] = document.getElementById('yp').value;
    zoom =document.getElementById('zoom').value;
    draw();
}