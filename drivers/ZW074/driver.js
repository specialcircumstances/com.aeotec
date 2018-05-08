'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// Engineering Sheet: https://aeotec.freshdesk.com/helpdesk/attachments/6009584696

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		measure_battery: {
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: report => {
				if (report && report['Battery Level'] === 'battery low warning') return 1;
				if (report && report.hasOwnProperty('Battery Level (Raw)')) return report['Battery Level (Raw)'][0];
				return null;
			},
		},
		alarm_motion: {
			command_class: 'COMMAND_CLASS_SENSOR_BINARY',
			command_get: 'SENSOR_BINARY_GET',
			command_report: 'SENSOR_BINARY_REPORT',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Sensor Value')) return report['Sensor Value'] === 'detected an event';
				return null;
			},
		},
		measure_temperature: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_get: 'SENSOR_MULTILEVEL_GET',
			command_get_parser: () => ({
				'Sensor Type': 'Temperature (version 1)',
				Properties1: {
					Scale: 0,
				},
			}),
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Sensor Type') && report.hasOwnProperty('Sensor Value (Parsed)')) {
					if (report['Sensor Type'] === 'Temperature (version 1)') return report['Sensor Value (Parsed)'];
				}
				return null;
			},
		},
		measure_luminance: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_get: 'SENSOR_MULTILEVEL_GET',
			command_get_parser: () => ({
				'Sensor Type': 'Luminance (version 1)',
				Properties1: {
					Scale: 1,
				},
			}),
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Sensor Type') && report.hasOwnProperty('Sensor Value (Parsed)')) {
					if (report['Sensor Type'] === 'Luminance (version 1)') return report['Sensor Value (Parsed)'];
				}
				return null;
			},
		},
		measure_humidity: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_get: 'SENSOR_MULTILEVEL_GET',
			command_get_parser: () => ({
				'Sensor Type': 'Relative humidity (version 2)',
				Properties1: {
					Scale: 0,
				},
			}),
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Sensor Type') && report.hasOwnProperty('Sensor Value (Parsed)')) {
					if (report['Sensor Type'] === 'Relative humidity (version 2)') return report['Sensor Value (Parsed)'];
				}
				return null;
			},
		},
	},
	settings: {
		"3": {
			index: 3,
			size: 2,
		},
		"4": {
			index: 4,
			size: 1,
		},
		"40": {
			index: 40,
			size: 1,
		},
		"41": {
			index: 41,
			size: 2,
			parser: newValue => new Buffer([newValue, 0]),
			signed: false,
		},
		"42": {
			index: 42,
			size: 2,
			parser: newValue => new Buffer([newValue, 0]),
		},
		"43": {
			index: 43,
			size: 2,
			parser: newValue => new Buffer([newValue, 0]),
			signed: false,
		},
		"44": {
			index: 44,
			size: 2,
			parser: newValue => new Buffer([newValue, 0]),
		},
		"102": {
			index: 102,
			size: 4,
		},
		"103": {
			index: 103,
			size: 4,
		},
		"111": {
			index: 111,
			size: 4,
		},
		"112": {
			index: 112,
			size: 4,
		},
		"113": {
			index: 113,
			size: 4,
		},
	},
});
