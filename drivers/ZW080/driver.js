'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// http://www.pepper1.net/zwavedb/device/834
// https://aeotec.freshdesk.com/helpdesk/attachments/6009584694

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		onoff: [
			{
				command_class: 'COMMAND_CLASS_SWITCH_BINARY',
				command_get: 'SWITCH_BINARY_GET',
				command_set: 'SWITCH_BINARY_SET',
				command_set_parser: value => {
					console.log('onoff set', value);
					return {
						'Switch Value': (value) ? 255 : 0,
					}
				},
				command_report: 'SWITCH_BINARY_REPORT',
				command_report_parser: report => {

					console.log('onoff get', report['Value'] === 'on/enable');

					return report['Value'] === 'on/enable'
				}
			},
			{
				command_class: 'COMMAND_CLASS_BASIC',
				command_report: 'BASIC_REPORT',
				command_report_parser: (report, node) => {

					console.log('onoff get', report['Value'] === 255);

					if (report['Value'] === 255) {
						Homey.manager('flow').triggerDevice('ZW080-alarm_on', {}, {}, node.device_data, (err, result) => {
							console.log(err, result);
						});
					} else {
						Homey.manager('flow').triggerDevice('ZW080-alarm_off', {}, {}, node.device_data, (err, result) => {
							console.log(err, result);
						});
					}

					return report['Value'] === 255
				}
			}
		],
	},
	settings: {
		"37": {
			index: 37,
			size: 2,
		},
	},
});

Homey.manager('flow').on('action.ZW080-turn_alarm_on', (callback, args) => {
	const node = module.exports.nodes[args.device.token];
	if (node && node.hasOwnProperty('instance') && node.instance.hasOwnProperty('CommandClass') && node.instance.CommandClass['COMMAND_CLASS_SWITCH_BINARY']) {
		node.instance.CommandClass['COMMAND_CLASS_SWITCH_BINARY'].SWITCH_BINARY_SET({
			'Switch Value': 255
		}, (err, result) => callback(err, result));
	} else return callback('invalid_device_command_class');
});

Homey.manager('flow').on('action.ZW080-turn_alarm_off', (callback, args) => {
	const node = module.exports.nodes[args.device.token];
	if (node && node.hasOwnProperty('instance') && node.instance.hasOwnProperty('CommandClass') && node.instance.CommandClass['COMMAND_CLASS_SWITCH_BINARY']) {
		node.instance.CommandClass['COMMAND_CLASS_SWITCH_BINARY'].SWITCH_BINARY_SET({
			'Switch Value': 0
		}, (err, result) => callback(err, result));
	} else return callback('invalid_device_command_class');
});

Homey.manager('flow').on('action.ZW080-set_alarm', (callback, args) => {
	const node = module.exports.nodes[args.device.token];

	if (node && typeof node.instance.CommandClass.COMMAND_CLASS_CONFIGURATION !== 'undefined') {
		let newValue, bufferValue;
		try {
			newValue = parseInt(args.sound) + parseInt(args.volume);
			bufferValue = new Buffer(2);
			bufferValue.writeUIntBE(newValue, 0, 2);
		} catch(err) {
			return callback(err, false);
		}

		if (newValue && bufferValue) {
			node.instance.CommandClass.COMMAND_CLASS_CONFIGURATION.CONFIGURATION_SET({
				'Parameter Number': 37,
				Level: {
					Size: 2,
					Default: false,
				},
				'Configuration Value': bufferValue,
			}, (err, result) => {
				// If error, stop flow card
				if (err) return callback(err, false);
				if (result === 'TRANSMIT_COMPLETE_OK') {
					module.exports.setSettings(node.device_data, {
						37: newValue,
					});
					return callback(null, true);
				}
				return callback(result, false);
			});
		}
	}
});
