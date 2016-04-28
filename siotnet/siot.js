var siot = require('../../siot.net/index');

module.exports = function(RED) {
    function SiotCenterNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        this.siotGateway = new siot.gateway({
            centerLicense: config.licenseID //,
            //mqttCenterURLs: ['mqtt://web:1234@formula.xrj.ch']
        });
    }
    RED.nodes.registerType("siot-center", SiotCenterNode);


    function SiotNetIn(config) {
        RED.nodes.createNode(this,config);
        var thisNode = this;

        thisNode.siotCenterNode = RED.nodes.getNode(config.siotCenter);
        thisNode.siotDevice = new siot.actor(config);

        thisNode.siotDevice.on('siot_data', function(data) {
            thisNode.send({
                topic: thisNode.siotDevice.uuid,
                payload: data
            });
        });

        if(thisNode.siotCenterNode) {

            thisNode.status({fill:"red",shape:"ring",text:"common.status.disconnected"});

            thisNode.siotCenterNode.siotGateway.on('connect', function(){
                thisNode.status({fill:"green",shape:"dot",text:"common.status.connected"});
            });
            thisNode.siotCenterNode.siotGateway.on('close', function(){
                thisNode.status({fill:"red",shape:"ring",text:"common.status.disconnected"});
            });


            thisNode.siotCenterNode.siotGateway.registerDevice(thisNode.siotDevice, function(err) {
                if(err) return thisNode.error('error on registerDevice');

                thisNode.siotCenterNode.siotGateway.connect(function(err) {
                    if(err) return thisNode.log(RED._("mqtt.state.connect-failed",{broker: err.toString()}));

                    thisNode.log(RED._("mqtt.state.connected",{broker: thisNode.siotCenterNode.siotGateway.connectedURL}));
                });
            });
        } else {
            thisNode.error(RED._("mqtt.errors.missing-config"));
        }
    }
    RED.nodes.registerType("siot-net in",SiotNetIn);

    function SiotNetOut(config) {
        RED.nodes.createNode(this,config);
        var thisNode = this;

        thisNode.siotCenterNode = RED.nodes.getNode(config.siotCenter);
        thisNode.siotDevice = new siot.sensor(config);

        if(thisNode.siotCenterNode) {

            thisNode.status({fill:"red",shape:"ring",text:"common.status.disconnected"});

            thisNode.siotCenterNode.siotGateway.on('connect', function(){
                thisNode.status({fill:"green",shape:"dot",text:"common.status.connected"});
            });
            thisNode.siotCenterNode.siotGateway.on('close', function(){
                thisNode.status({fill:"red",shape:"ring",text:"common.status.disconnected"});
            });

            thisNode.siotCenterNode.siotGateway.registerDevice(thisNode.siotDevice, function(err) {
                if(err) return thisNode.error('error on registerDevice');

                thisNode.siotCenterNode.siotGateway.connect(function(err) {
                    if(err) return thisNode.log(RED._("mqtt.state.connect-failed",{broker: err.toString()}));

                    thisNode.log(RED._("mqtt.state.connected",{broker: thisNode.siotCenterNode.siotGateway.connectedURL}));
                });
            });
        } else {
            thisNode.error(RED._("mqtt.errors.missing-config"));
        }

        this.on('input', function(msg) {
            thisNode.siotDevice.sendRawData(msg.payload);
        });
    }
    RED.nodes.registerType("siot-net out",SiotNetOut);

    /*
    function SiotIoIn(config) {
        RED.nodes.createNode(this,config);
        var node = this;


    }
    RED.nodes.registerType("siot-io in",SiotIoIn);


    function SiotIoOut(config) {
        RED.nodes.createNode(this,config);
        var node = this;


    }
    RED.nodes.registerType("siot-io out",SiotIoOut);
    */
};
