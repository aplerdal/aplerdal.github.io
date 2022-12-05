function GetBGRInput(){
    let bgrColor = document.getElementById('Bgr').value;
    if (bgrColor.length==4) {
        let bgrHex = '#'+bgrToHex(bgrColor);
        let luminace = 0.2126*hexToRgb(bgrHex)[0] + 0.7152*hexToRgb(bgrHex)[1] + 0.0722*hexToRgb(bgrHex)[2];
        if(luminace<128){textColor = '#FFFFFF';}else{textColor = '#000000';}
        //---
        document.getElementById('Bgr').style.color = textColor;
        document.getElementById('Bgr').style.backgroundColor = bgrHex;

        document.getElementById('Hex').style.color = textColor;
        document.getElementById('Hex').style.backgroundColor = bgrHex;

        document.getElementById('Hex').value = bgrToHex(bgrColor);
        console.log(bgrToHex(bgrColor))

        document.getElementById('Rgb').style.color = textColor;
        document.getElementById('Rgb').style.backgroundColor = 'rgb('+hexToRgb(bgrHex)[0]+',0,0)';
        document.getElementById('Rgb1').style.color = textColor;
        document.getElementById('Rgb1').style.backgroundColor = 'rgb(0,'+hexToRgb(bgrHex)[1]+',0)';
        document.getElementById('Rgb2').style.color = textColor;
        document.getElementById('Rgb2').style.backgroundColor = 'rgb(0,0,' + hexToRgb(bgrHex)[2] +')';

        document.getElementById('Rgb').value = hexToRgb(bgrHex)[0];
        document.getElementById('Rgb1').value = hexToRgb(bgrHex)[1];
        document.getElementById('Rgb2').value = hexToRgb(bgrHex)[2];
        console.log(hexToRgb(bgrHex)[0] + ',' + hexToRgb(bgrHex)[1] + ',' + hexToRgb(bgrHex)[2])
        //---
    }
}
function GetHexInput(){
    let hexColor = document.getElementById('Hex').value;
    if(hexColor.length==6){
        let hexBgr = HexToBgr(hexColor);
        let luminace = 0.2126*hexToRgb(hexColor)[0] + 0.7152*hexToRgb(hexColor)[1] + 0.0722*hexToRgb(hexColor)[2];
        if(luminace<128){textColor = '#FFFFFF';}else{textColor = '#000000';}

        //---
        document.getElementById('Bgr').style.color = textColor;
        document.getElementById('Bgr').style.backgroundColor = '#'+hexColor;

        document.getElementById('Hex').style.color = textColor;
        document.getElementById('Hex').style.backgroundColor = '#'+hexColor;

        document.getElementById('Bgr').value = hexBgr;
        console.log(hexBgr);

        document.getElementById('Rgb').style.color = textColor;
        document.getElementById('Rgb').style.backgroundColor = 'rgb('+hexToRgb(hexColor)[0]+',0,0)';
        document.getElementById('Rgb1').style.color = textColor;
        document.getElementById('Rgb1').style.backgroundColor = 'rgb(0,'+hexToRgb(hexColor)[1]+',0)';
        document.getElementById('Rgb2').style.color = textColor;
        document.getElementById('Rgb2').style.backgroundColor = 'rgb(0,0,' + hexToRgb(hexColor)[2] +')';

        document.getElementById('Rgb').value = hexToRgb(hexColor)[0];
        document.getElementById('Rgb1').value = hexToRgb(hexColor)[1];
        document.getElementById('Rgb2').value = hexToRgb(hexColor)[2];
        console.log(hexToRgb(hexColor)[0] + ',' + hexToRgb(hexColor)[1] + ',' + hexToRgb(hexColor)[2])
        //---
    }
}

function CopyBgr(){
    navigator.clipboard.writeText(document.getElementById('Bgr').value);
}
function CopyHex(){
    navigator.clipboard.writeText('#' + document.getElementById('Hex').value);
}
function CopyRgb(){
    navigator.clipboard.writeText('rgb(' + document.getElementById('Rgb').value + ',' +document.getElementById('Rgb1').value + ',' + document.getElementById('Rgb2').value + ')');
}

//--------------

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
    if (endian === 'small') {
        return bgr;
    } else {
        return bgr.slice(2, 4) + bgr.slice(0, 2);
    }
}

function HexToBgr(hexColor) {
    const r = Math.floor(parseInt(hexColor.slice(0, 2), 16) / 8) << 0;
    const g = Math.floor(parseInt(hexColor.slice(2, 4), 16) / 8) << 5;
    const b = Math.floor(parseInt(hexColor.slice(4, 6), 16) / 8) << 10;
    return (b + g + r).toString(16).padStart(4, '0').toUpperCase(); // big endian
}

function rgbToHex(red, green, blue) {
    return ColorToHex(red) + ColorToHex(green) + ColorToHex(blue);
}
function ColorToHex(color) {
    var hexadecimal = color.toString(16);
    return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(result){
        var r= parseInt(result[1], 16);
        var g= parseInt(result[2], 16);
        var b= parseInt(result[3], 16);
        return [r,g,b];
    } 
    return null;
  }