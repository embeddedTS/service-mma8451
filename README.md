NXP MMA8451 3-axis Accelerometer Service plug-in for express-modular-server
===========================================================================

This is a plug-in for [express-modular-server](https://github.com/michael-ts/express-modular-server/).  It provides a service which samples the NXP MMA8451 3-axis accelerator through the Linux event device for the specified amount of time.

If a string option is presented upon initialization, it is the base endpoint to serve accelerometer samples from.  If this option is not present,  a base endpoint of `/accelerometer/` is used.

# Install

    npm install service-mma8451

The device you are running on must have kernel support for the mma8451.  This code has been tested on a Technologic Systems [TS-7680 with accelerometer option](https://wiki.embeddedarm.com/wiki/TS-7680#Accelerometer), compiling and installing support for boards shipped without it can be found [here](https://wiki.embeddedarm.com/wiki/TS-7680#Compile_the_Kernel).

# Usage

The following example loads the `mma8451` module with the default endpoint:

    var server = require("express-modular-server")({
         http:true
       })
        // other API calls here
        .API("mma8451")
        .start()

In this example, an endpoint of `/acc` is used to serve accelerometer samples:


    var server = require("express-modular-server")({
         http:true
       })
        // other API calls here
        .API("mma8451","/acc/")
        .start()

To acquire accelerometer samples from the endpoint, pass the number of milliseconds after the trailing slash.  The data is returned a `text/plain` which each line containing comma separated values of  time (as number of milliseconds sinch the Epoch), x, y, and z-axis values as reported by the chip according to the current scale.

Example (sample accelerometer for 1 second):

    wget http://192.168.1.100/accelerometer/1000


# To Do

Allow for an object to be passed to options.  Allow for a key in the object to specify the scale to use and the polling period.

Don't hardcode the event device file.

# Copyright

Written by Michael Schmidt.

# License

GPL 3.0
