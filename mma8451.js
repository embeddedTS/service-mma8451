"use strict"

var fs = require("fs")

function listen(callback) {
    var fd
    var x,y,z,t,state=0,ret
    
    fd = fs.createReadStream("/dev/input/event0")
    fd.on("data", function (chunk) {
	var i=0,got=0
	while (chunk.length - i >= 16) {
	    var s = chunk.readUInt32LE(i+0)
	    var us = chunk.readUInt32LE(i+4)
	    var type = chunk.readUInt16LE(i+8)
	    var code = chunk.readUInt16LE(i+10)
	    var value = chunk.readInt32LE(i+12)
	    i += 16
	    if (type == 3) {
		switch (code) {
		case 0: x = value; state++; break
		case 1: y = value; state++; break
		case 2: z = value; state++; break
		}
	    } else if (type == 0 && code == 0) {
		//console.log("state="+state)
		if (state == 3) {
		    t = s+us/1000000
		    callback(t,x,y,z)
		    got++
		    // console.log(t+":"+x+","+y+","+z)
		    /*
		    ret.samples.push([t,x,y,z])
		    if (ret.samples.length >= min) {
			callback(ret.samples)
			ret.samples = [ ]
		    }
		    */
		}
		state = 0
	    }
	    //console.log(s+"."+us+":"+type+":"+code+":"+value)
	}
    })
    
    ret={ stop: function() {
	fd.close()
    } }
    return ret
}


function Server(req,res) {
    var url = req.path.split("/")
    if (url.length < 2) return res.send("ERROR")
    var num = Number(url[1])
    console.log(req.path+":"+num)
    if (num < 0 || num > 3600000) return res.send("ERROR")

    res.setHeader("Content-Type","text/plain")
    var acc = listen(function(t,x,y,z) {
	//var a = Math.sqrt( x*x + y*y + z*z ) / 16384
	res.write(t+","+x+","+y+","+z+"\n")
	//console.log(t+":"+a)
    })
    
    setTimeout(function() {
	acc.stop()
	res.end()
    },num)
    
}


var endpoint = "/accelerometer/"

module.exports = function(app,exports,options) {
    if (options && typeof options == "string") {
	endpoint = options
    }
    Log("service mma8451 ",endpoint)
    // initialize accelerometer parameters: enable and set kernel polling rate
    var wstream = fs.createWriteStream("/sys/devices/virtual/input/input0/enable")
    wstream.write("1\n")
    wstream.end()
    wstream = fs.createWriteStream("/sys/devices/virtual/input/input0/poll")
    wstream.write("10\n")
    wstream.end()
    // +/- 2g
    wstream = fs.createWriteStream("/sys/devices/virtual/input/input0/scalemode")
    wstream.write("0\n")
    wstream.end()
    app.get(endpoint, Server)
}
