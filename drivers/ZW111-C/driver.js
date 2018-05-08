'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// Documentation: http://Products.Z-WaveAlliance.org/ProductManual/File?folder=&filename=Manuals/2135/Aeon Labs Nano Dimmer manual.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		onoff: [{
			command_class: 'COMMAND_CLASS_SWITCH_BINARY',
			command_get: 'SWITCH_BINARY_GET',
			command_set: 'SWITCH_BINARY_SET',
			command_set_parser: value => ({
				'Switch Value': (value) ? 0xFF : 0x00,
			}),
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Value')) {
					if (report.Value === 'on/enable') return true;
					else if (report.Value === 'off/disable') return false;
				}
				return null;
			},
		}, {
			command_class: 'COMMAND_CLASS_BASIC',
			command_report: 'BASIC_SET',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Value')) return report.Value > 0;
				return null;
			},
		}],
		dim: {
			command_class: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: value => ({
				Value: Math.round(value * 99),
				'Dimming Duration': 255,
			}),
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: (report, node) => {
				if (report && report.hasOwnProperty('Value (Raw)')) {
					if (report['Value (Raw)'][0] === 255) {
						module.exports.realtime(node.device_data, 'onoff', true);
						return 1;
					}
					const value = report['Value (Raw)'][0] / 99;
					if (value === 0) module.exports.realtime(node.device_data, 'onoff', false);
					else module.exports.realtime(node.device_data, 'onoff', true);
					return report['Value (Raw)'][0] / 99;
				}
				return null;
			},
		},
		measure_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_parser: () => ({
				'Sensor Type': 'Electric meter',
				Properties1: {
					Scale: 2,
				},
			}),
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Properties2') &&
					report.Properties2.hasOwnProperty('Scale bits 10') &&
					report.Properties2['Scale bits 10'] === 2) {
					return report['Meter Value (Parsed)'];
				}
				return null;
			},
		},
		meter_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_parser: () => ({
				'Sensor Type': 'Electric meter',
				Properties1: {
					Scale: 0,
				},
			}),
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Properties2') &&
					report.Properties2.hasOwnProperty('Scale bits 10') &&
					report.Properties2['Scale bits 10'] === 0) {
					return report['Meter Value (Parsed)'];
				}
				return null;
			},
		},
	},
	settings: {
		"3": {
			index: 3,
			size: 1,
		},
		"4": {
			index: 4,
			size: 1,
		},
		"20": {
			index: 20,
			size: 1,
		},
		"80": {
			index: 80,
			size: 1,
		},
		"81": {
			index: 81,
			size: 1,
		},
		"82": {
			index: 82,
			size: 1,
		},
		"85": {
			index: 85,
			size: 4,
		},
		"86": {
			index: 86,
			size: 4,
		},
		"90": {
			index: 90,
			size: 1,
		},
		"91": {
			index: 91,
			size: 2,
		},
		"92": {
			index: 92,
			size: 1,
		},
		"100": {
			index: 100,
			size: 1,
		},
		"101": {
			index: 101,
			size: 4,
		},
		"102": {
			index: 102,
			size: 1,
		},
		"103": {
			index: 103,
			size: 1,
		},
		"110": {
			index: 110,
			size: 1,
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
		"120": {
			index: 120,
			size: 1,
		},
		"121": {
			index: 121,
			size: 1,
		},
		"122": {
			index: 122,
			size: 1,
		},
		"123": {
			index: 123,
			size: 1,
		},
		"124": {
			index: 124,
			size: 1,
		},
		"125": {
			index: 125,
			size: 1,
		},
		"128": {
			index: 128,
			size: 1,
		},
		"129": {
			index: 129,
			size: 1,
		},
		"130": {
			index: 130,
			size: 1,
		},
		"131": {
			index: 131,
			size: 1,
		},
		"132": {
			index: 132,
			size: 1,
		},
		"249": {
			index: 249,
			size: 1,
		},
		"252": {
			index: 252,
			size: 1,
		},
		"255": {
			index: 255,
			size: 4,
		},
	},
});
