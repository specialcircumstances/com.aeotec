'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// http://www.pepper1.net/zwavedb/device/833

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		alarm_contact: {
			command_class: 'COMMAND_CLASS_SENSOR_BINARY',
			command_report: 'SENSOR_BINARY_REPORT',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Sensor Value')) return report['Sensor Value'] === 'detected an event';
				return null;
			}
		},
		measure_battery: {
			getOnWakeUp: true,
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: report => {
				if (!report) return null;
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
		"101": {
			index: 101,
			size: 1,
		},
	},
});
