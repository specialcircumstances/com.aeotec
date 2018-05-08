'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// Documentation: http://Products.Z-WaveAlliance.org/ProductManual/File?folder=&filename=Manuals/1998/Range Extender 6 manual.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {},
	settings: {
		"82": {
			index: 82,
			size: 1,
			parser: value => new Buffer([Number(!value)]),
		},
	},
});
