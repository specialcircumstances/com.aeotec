'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// Documentation: http://Products.Z-WaveAlliance.org/ProductManual/File?folder=&filename=Manuals/1615/Door Window Sensor 6 manual.pdf

//TODO images and icons

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		alarm_contact: [{
			command_class: 'COMMAND_CLASS_SENSOR_BINARY',
			command_get: 'SENSOR_BINARY_GET',
			command_report: 'SENSOR_BINARY_REPORT',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Sensor Value')) {
					return report['Sensor Value'] === 'detected an event';
				}
				return null;
			},
		}, {
			command_class: 'COMMAND_CLASS_BASIC',
			command_report: 'BASIC_SET',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Value')) {
					return report.Value === 255;
				}
				return null;
			},
		}],
		measure_battery: {
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: report => {
				if (report['Battery Level'] === 'battery low warning') return 1;
				if (report.hasOwnProperty('Battery Level (Raw)')) return report['Battery Level (Raw)'][0];
				return null;
			},
		},
	},
	settings: {
		"1": {
			index: 1,
			size: 1,
		},
		"39": {
			index: 39,
			size: 1,
		},
		"101": {
			index: 101,
			size: 1,
		},
		"111": {
			index: 111,
			size: 4,
		},
	},
});
