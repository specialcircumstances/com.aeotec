'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// http://products.z-wavealliance.org/products/1003
// http://www.pepper1.net/zwavedb/device/637

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		alarm_water: [{
			command_class: 'COMMAND_CLASS_SENSOR_BINARY',
			command_get: 'SENSOR_BINARY_GET',
			command_report: 'SENSOR_BINARY_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Sensor Value')) return report['Sensor Value'] === 'detected an event';
				return null;
			}
			},
			{
			command_class: 'COMMAND_CLASS_BASIC',
			command_set: 'BASIC_SET',
			command_get: 'BASIC_GET',
			command_report: 'BASIC_SET',
			command_report_parser: report => {
				if (report.hasOwnProperty('Value')) return report['Value'] !== 0;
				if (report.hasOwnProperty('Value (Raw)')) {
					return report['Value (Raw)'][0] !== 0;
				}
				return null;
			}
			},
		],
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
		"121": {
			index: 121,
			size: 4,
		},
	},
	debug: false,
});
