"use script"

var fs = require("fs")

function listen(callback) {
    var fd
    var buffer
    var x,y,z,t,ok,samples,ret
    
    fd = fs.createReadStream("/dev/input/event0")
    buffer = new Buffer(16)
    ok=0
    samples=[]
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
		case 0: x = value; ok++; break
		case 1: y = value; ok++; break
		case 2: z = value; ok++; break
		}
	    } else if (type == 0 && code == 0) {
		//console.log("ok="+ok)
		if (ok == 3) {
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
		    count++
		}
		ok = 0
	    }
	    //console.log(s+"."+us+":"+type+":"+code+":"+value)
	}
    })
    
    ret={ stop: function() {
	fd.close()
    } }
    return ret
}


function Server(req,res,next) {
    var url = req.path.split("/")
    if (url.length < 2) return res.send("ERROR")
    var num = Number(url[1])
    if (num < 0 || num > 3600000) return res.send("ERROR")
    
    var acc = listen(function(t,x,y,z) {
	var a = Math.sqrt( x*x + y*y + z*z ) / 16384
	//console.log(t+":"+a)
    })
    
    setTimeout(function() {
	acc.stop()
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
    app.use(endpoint, Server)
}
