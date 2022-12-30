// Get button and container elements from HTML
var canvas = document.getElementById("paint");
var ctx = canvas.getContext('2d', {willReadFrequently: true});
var sketch = document.getElementById("sketch");
var sketch_style = getComputedStyle(sketch);
canvas.width = parseInt(sketch_style.getPropertyValue('width'));
canvas.height = parseInt(sketch_style.getPropertyValue('height'));
var buttons = document.querySelectorAll(".trainer");
var trained = document.querySelector("h2");
var clear = document.getElementById("clear");
var ebut = document.getElementById("ebutton");
var comp = document.getElementById("compare");
var not_training = true

var mouse = {x: 0, y: 0};
var last_mouse = {x: 0, y: 0};

// Drawing config
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.lineWidth = 30;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = 'white';

/* EVENTHANDLER */
// Mouse Capturing Work
canvas.addEventListener('mousemove', function(e) {
    last_mouse.x = mouse.x;
    last_mouse.y = mouse.y;
    
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
}, false);

// Start drawing
canvas.addEventListener('mousedown', function() {
    if (not_training) {
        canvas.addEventListener('mousemove', onPaint, false);
    } else {
        alert("please wait for training");
    }
}, false);

// Stop drawing
canvas.addEventListener('mouseup', function() {
    if (not_training) {
        canvas.removeEventListener('mousemove', onPaint, false);
        trained.style.backgroundColor = 'black';
        trained.innerHTML = '';
        
        // send processed img-data to python and fetch predictions
        fetch("/", {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(img_data_norm_res())
        })
        .then(res => {
            if (res.ok) {
                return res.json()
                    } else {
                        alert("something went wrong")
                    }
                })
                .then(jres => {
                    update_table(jres);     // update table with predictions 
                    trained.innerHTML = ""          // & remove training-status
                })
                .catch((err) => console.error(err));
                
    }
}, false);
    
    
  
// Clear button      
clear.addEventListener('click', function() { 
    if (not_training) { 
    ctx.fillStyle = 'black';                               
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        alert("please wait for training");
    }
});

// Training buttons
for (let i = 0; i < 10; i++) {
    buttons[i].addEventListener('click', function() {
        var rq = [buttons[i].innerHTML, img_data_norm_res()];
        not_training = false;
        trained.style.backgroundColor = 'blue';
        trained.innerHTML = "Training model ...";              // set training-status
        //fetch request to train model
        fetch("/", {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(rq)
        })
        .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    alert("something went wrong");
                }
            })
            .then(jres => {
                ctx.fillStyle = 'black';                            // clear canvas
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                not_training = true;
                trained.style.backgroundColor = 'green';            // set trained-status
                trained.innerHTML = jres;
            })
            .catch(err => console.error(err));
    }, false);
};

// Eval button
ebut.addEventListener('click', function() {    
    if (not_training) {
        trained.style.backgroundColor = 'orange';
        trained.innerHTML = "Evaluating ...";  
        fetch("/", {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify("EVAL")
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                alert("something went wrong");
            }
        })
        .then(jres => {
            trained.style.backgroundColor = 'black';
            trained.innerHTML = "";
            var loss1 = jres[0].toFixed(2);
            var loss2 = jres[1];
            if (loss2 !== "-") {
                loss2 = loss2.toFixed(2)
            };
            comp.innerHTML = `U: ${loss1} | T: ${loss2}`;
        })
        .catch(err => console.error(err));
    } else {
        alert("please wait for training");
    }
});

/* FUNCTIONS */
var onPaint = function() {
    ctx.beginPath();
    ctx.moveTo(last_mouse.x, last_mouse.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.closePath();
    ctx.stroke();
    // fetching predictions here would mean REALTIME!!!!
};

function img_data_norm_res() {
    var target = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    target = get_one_channel(target);
    target = halfres(target);       // 448 > 224
    target = halfres(target);       // 224 > 112
    target = halfres(target);       // 112 > 56
    target = halfres(target);       // 56 > 28
    target = target.slice(0, 784);  // cut array at 28*28=784
    target = normalize(target);

    return target;
};

function get_one_channel(pixels) {  // shouldnt matter if i=0,1,2 but not 3 (alpha channel)
    var tar = [];
    var borderlen = Math.sqrt(pixels.length);
    for (let i = 0; i < borderlen * borderlen * 4; i+=4) {
        tar.push(pixels[i])
    };
    return tar;
};

function halfres(pixels) {
    var resized = [];
    var bl = Math.sqrt(pixels.length);
    var tmp = []
    for (let i = 0; i < bl; i++) {              
        tmp[i] = [];                            
        for (let j = 0; j < bl; j++) {
            tmp[i].push(pixels[ i*bl + j ])     
        };                                      // arranging flattened image in width*height
    };                                          // for easier processing
                                                
    for (let i = 1; i < bl; i+=2) {
        for (let j = 1; j < bl; j+=2) {
            var pix = (tmp[i][j] + tmp[i-1][j-1] + tmp[i-1][j] + tmp[i][j-1]) / 4;
            resized.push(pix);
        };
    };
    return resized;
};

function normalize(pixels) {
    for (let i = 0; i < pixels.length; i++) {
        pixels[i] = pixels[i] / 255
    };
    return pixels;
}

function update_table(data) {
    max = Math.max(...data);
    for (var i = 0; i<10; i++) {
        var td = document.querySelector(`#td${i}`);
        var tdx = document.querySelector(`#tdx${i}`);
        if (data[i] == max) {
            td.style.backgroundColor = '#357070'
            tdx.style.backgroundColor = '#357070'
        } else {
            td.style.backgroundColor = 'black'
            tdx.style.backgroundColor = 'black'
        };
        td.innerHTML = `${(data[i] * 100).toFixed(1)} %`;
    };
}
