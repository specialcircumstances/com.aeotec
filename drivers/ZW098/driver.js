'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');
const tinycolor = require('tinycolor2');

// http://www.smarthome.com.au/media/manuals/Aeotec_Z-Wave_LED_Bulb_Product_Manual.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		onoff: {
			command_class: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: value => ({
				'Value': (value) ? 'on/enable' : 'off/disable',
				'Dimming Duration': 'Factory default',
			}),
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (typeof report['Value'] === 'string') {
					return report['Value'] === 'on/enable';
				} else if (report.hasOwnProperty('Value (Raw)')) {
					return report['Value (Raw)'][0] > 0;
				}
				return null;
			},
		},
		dim: {
			command_class: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: (value, node) => {
				if (value >= 1) value = 0.99;

				// Update immediately
				node.state.dim = value;

				return {
					'Value': value * 100,
					'Dimming Duration': 'Factory default',
				};
			},
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (typeof report['Value'] === 'string') {
					return (report['Value'] === 'on/enable') ? 1.0 : 0.0;
				} else if (report.hasOwnProperty('Value (Raw)')) {
					return report['Value (Raw)'][0] / 100;
				}
				return null;
			},
		},
		light_hue: {
			command_class: 'COMMAND_CLASS_SWITCH_COLOR',
			command_set: 'SWITCH_COLOR_SET',
			command_set_parser: (value, node) => {

				console.log(`value: ${value}`);
				console.log(`node.state: ${JSON.stringify(node.state)}`);

				// Update immediately
				node.state.light_hue = value;

				// Convert updated hue to rgb
				const rgb = hueCommandSetParser(value, node);

				return {
					'Properties1': {
						'Color Component Count': 5,
					},
					'vg1': [
						{
							'Color Component ID': 0, // WW
							'Value': 0,
						},
						{
							'Color Component ID': 1, // CW
							'Value': 0,
						},
						{
							'Color Component ID': 2, // R
							'Value': rgb['r'],
						},
						{
							'Color Component ID': 3, // G
							'Value': rgb['g'],
						},
						{
							'Color Component ID': 4, // B
							'Value': rgb['b'],
						},
					],
				};
			},
		},

		light_saturation: {
			command_class: 'COMMAND_CLASS_SWITCH_COLOR',
			command_set: 'SWITCH_COLOR_SET',
			command_set_parser: (value, node) => {

				console.log(`value: ${value}`);
				console.log(`node.state: ${JSON.stringify(node.state)}`);

				// Update immediately
				node.state.light_saturation = value;

				// Convert updated saturation to rgb
				const rgb = saturationCommandSetParser(value, node);

				return {
					'Properties1': {
						'Color Component Count': 5,
					},
					'vg1': [
						{
							'Color Component ID': 0, // WW
							'Value': 0,
						},
						{
							'Color Component ID': 1, // CW
							'Value': 0,
						},
						{
							'Color Component ID': 2, // R
							'Value': rgb['r'],
						},
						{
							'Color Component ID': 3, // G
							'Value': rgb['g'],
						},
						{
							'Color Component ID': 4, // B
							'Value': rgb['b'],
						},
					],
				};
			},
		},

		light_temperature: {
			command_class: 'COMMAND_CLASS_SWITCH_COLOR',
			command_set: 'SWITCH_COLOR_SET',
			command_set_parser: (value, node) => {

				console.log(`value: ${value}`);
				console.log(`node.state: ${JSON.stringify(node.state)}`);

				// Update immediately
				node.state.light_temperature = value;

				// If value above 0.5 construct warm white value
				const ww = (value >= 0.5) ? map(0.5, 1, 10, 255, value) : 0;

				// If value below 0.5 construct cool white value
				const cw = (value < 0.5) ? map(0, 0.5, 255, 10, value) : 0;

				// Get rgb object from node state
				const rgb = tinycolor({
					h: (node.state.light_hue || 1) * 360,
					s: (node.state.light_saturation || 1) * 100,
					v: (node.state.dim || 1) * 100,
				}).toRgb();

				return {
					'Properties1': {
						'Color Component Count': 5,
					},
					'vg1': [
						{
							'Color Component ID': 0, // WW
							'Value': ww,
						},
						{
							'Color Component ID': 1, // CW
							'Value': cw,
						},
						{
							'Color Component ID': 2, // R
							'Value': rgb['r'],
						},
						{
							'Color Component ID': 3, // G
							'Value': rgb['g'],
						},
						{
							'Color Component ID': 4, // B
							'Value': rgb['b'],
						},
					],
				};
			},
		},
		light_mode: {
			command_class: 'COMMAND_CLASS_SWITCH_COLOR',
			command_set: 'SWITCH_COLOR_SET',
			command_set_parser: (value, node) => {

				if (typeof node.state.light_temperature === 'undefined') node.state.light_temperature = 0.5;

				console.log(`value: ${value}`);
				console.log(`node.state: ${JSON.stringify(node.state)}`);

				// Update immediately
				node.state.light_mode = value;

				// If value above 0.5 construct warm white value
				let ww = (node.state.light_temperature >= 0.5) ? Math.round(map(0.5, 1, 10, 255, node.state.light_temperature)) : 0;

				// If value below 0.5 construct cool white value (from 255 - 0 for slider)
				let cw = (node.state.light_temperature < 0.5) ? Math.round(map(0, 0.5, 255, 10, node.state.light_temperature)) : 0;

				// Get rgb object from node state
				const rgb = tinycolor({
					h: (node.state.light_hue || 1) * 360,
					s: (node.state.light_saturation || 1) * 100,
					v: (node.state.dim || 1) * 100,
				}).toRgb();

				// If new mode is color set ww and cw to zero
				if (value === 'color') {
					ww = 0;
					cw = 0;
				} else {

					// New mode is temperature set rgb to zero
					rgb['r'] = 0;
					rgb['g'] = 0;
					rgb['b'] = 0;
				}

				return {
					'Properties1': {
						'Color Component Count': 5,
					},
					'vg1': [
						{
							'Color Component ID': 0, // WW
							'Value': ww,
						},
						{
							'Color Component ID': 1, // CW
							'Value': cw,
						},
						{
							'Color Component ID': 2, // R
							'Value': rgb['r'],
						},
						{
							'Color Component ID': 3, // G
							'Value': rgb['g'],
						},
						{
							'Color Component ID': 4, // B
							'Value': rgb['b'],
						},
					],
				};
			},
		},
	},
	beforeInit: (token, callback) => {
		const node = module.exports.nodes[token];
		if (node) {

			// Get WW
			const wwPromise = new Promise(resolve => {
				node.instance.CommandClass['COMMAND_CLASS_SWITCH_COLOR'].SWITCH_COLOR_GET({
					'Color Component ID': 0
				}, (err, result) => {
					if (result) return resolve(result['Value'] || 0);
					return resolve(0);
				});
			});

			// get CW
			const cwPromise = new Promise(resolve => {
				node.instance.CommandClass['COMMAND_CLASS_SWITCH_COLOR'].SWITCH_COLOR_GET({
					'Color Component ID': 1
				}, (err, result) => {
					if (result) return resolve(result['Value'] || 0);
					return resolve(0);
				});
			});

			// Wait for all white values to arrive
			Promise.all([wwPromise, cwPromise]).then(results => {

				// Determine light_mode
				if (results[0] === 0 && results[1] === 0) {
					node.state.light_mode = 'color';
				} else {
					node.state.light_mode = 'temperature';
				}

				// Determine light_temperature
				if (results[0] !== 0) {
					node.state.light_temperature = map(10, 255, 0.5, 1, results[0]);
				} else {
					node.state.light_temperature = map(255, 10, 0, 0.5, results[1]);
				}
			});

			// Get R
			const rPromise = new Promise(resolve => {
				node.instance.CommandClass['COMMAND_CLASS_SWITCH_COLOR'].SWITCH_COLOR_GET({
					'Color Component ID': 2
				}, (err, result) => {
					if (result) return resolve(result['Value'] || 0);
					return resolve(0);
				});
			});

			// Get G
			const gPromise = new Promise(resolve => {
				node.instance.CommandClass['COMMAND_CLASS_SWITCH_COLOR'].SWITCH_COLOR_GET({
					'Color Component ID': 3
				}, (err, result) => {
					if (result) return resolve(result['Value'] || 0);
					return resolve(0);
				});
			});

			// Get B
			const bPromise = new Promise(resolve => {
				node.instance.CommandClass['COMMAND_CLASS_SWITCH_COLOR'].SWITCH_COLOR_GET({
					'Color Component ID': 4
				}, (err, result) => {
					if (result) return resolve(result['Value'] || 0);
					return resolve(0);
				});
			});

			// Wait for all RGB values to arrive
			Promise.all([rPromise, gPromise, bPromise]).then(results => {

				const hsv = tinycolor({
					r: results[0] || 0,
					g: results[1] || 0,
					b: results[2] || 0
				}).toHsv();

				node.state.light_hue = hsv.h / 360;
				node.state.light_saturation = hsv.s;

				// Continue initializing the device
				callback();
			});
		}
	},
	settings: {
		"80": {
			index: 80,
			size: 1,
			parser: input => new Buffer([(input) ? 2 : 0]),
		},
		"34": {
			index: 34,
			size: 1,
			parser: input => new Buffer([(input) ? 1 : 0]),
		},
		"35": {
			index: 35,
			size: 1,
			parser: input => new Buffer([(input) ? 1 : 0]),
		},
	},
});

function hueCommandSetParser(value, node) {
	return tinycolor({
		h: value * 360,
		s: (node.state.light_saturation || 1) * 100,
		v: (node.state.dim || 1) * 100,
	}).toRgb();
}

function saturationCommandSetParser(value, node) {
	return tinycolor({
		h: (node.state.light_hue || 0) * 360,
		s: value * 100,
		v: (node.state.dim || 1) * 100,
	}).toRgb();
}

/**
 * Flow action handler that let the bulb
 * fade from one colour to another.
 */
Homey.manager('flow').on('action.zw098_from_to', (callback, args) => {
	if (args && args.device && args.device.token && args.speed && args.fadeType && args.cycles) {

		// Map speed 100 - 0 to 0 - 254
		args.speed = Math.round(map(100, 0, 0, 254, args.speed));

		// Get fadeType as integer
		args.fadeType = parseInt(args.fadeType);

		// Parse integers from strings
		args.color1 = parseInt(args.color1);
		args.color2 = parseInt(args.color2);

		const node = module.exports.nodes[args.device.token];

		if (node.instance.CommandClass['COMMAND_CLASS_CONFIGURATION']) {

			const colorCommand = new Buffer([getDecimalValueFromArrays(args.color2, 4, args.color1, 4), 0, 0, 0]);

			//Send parameter values to module
			node.instance.CommandClass['COMMAND_CLASS_CONFIGURATION'].CONFIGURATION_SET({
				"Parameter Number": 38,
				"Level": {
					"Size": 4,
					"Default": false
				},
				'Configuration Value': colorCommand

			}, (err, result) => {

				// If error, stop flow card
				if (err) {
					Homey.error(err);
					return callback(null, false);
				}

				// If properly transmitted, change the setting and finish flow card
				if (result === "TRANSMIT_COMPLETE_OK") {

					//Set the device setting to this flow value
					module.exports.setSettings(node.device_data, {
						38: colorCommand
					});

					const colorModeCommand = createColourCommand(2, args.fadeType, Math.round(args.cycles), args.speed, 5);

					//Send parameter values to module
					node.instance.CommandClass['COMMAND_CLASS_CONFIGURATION'].CONFIGURATION_SET({
						"Parameter Number": 37,
						"Level": {
							"Size": 4,
							"Default": false
						},
						'Configuration Value': colorModeCommand

					}, (err, result) => {

						// If error, stop flow card
						if (err) {
							Homey.error(err);
							return callback(null, false);
						}

						// If properly transmitted, change the setting and finish flow card
						if (result === "TRANSMIT_COMPLETE_OK") {


							//Set the device setting to this flow value
							module.exports.setSettings(node.device_data, {
								37: colorModeCommand
							});

							return callback(null, true);
						}

						// no transmition, stop flow card
						return callback(null, false);
					});
				}
			});
		} else return callback('missing COMMAND_CLASS_CONFIGURATION');
	} else return callback('invalid_device');

});

/**
 * Flow action handler for rainbow mode.
 */
Homey.manager('flow').on('action.zw098_rainbow', (callback, args) => {
	if (args && args.device && args.device.token && args.speed && args.fadeType && args.cycles) {

		// Map speed 100 - 0 to 0 - 254
		args.speed = Math.round(map(100, 0, 0, 254, args.speed));

		// Get fadeType as integer
		args.fadeType = parseInt(args.fadeType);

		// Round cycles
		args.cycles = Math.round(args.cycles);

		const node = module.exports.nodes[args.device.token];

		if (node.instance.CommandClass['COMMAND_CLASS_CONFIGURATION']) {

			const command = createColourCommand(1, args.fadeType, args.cycles, args.speed, 5);

			//Send parameter values to module
			node.instance.CommandClass['COMMAND_CLASS_CONFIGURATION'].CONFIGURATION_SET({
				"Parameter Number": 37,
				"Level": {
					"Size": 4,
					"Default": false
				},
				'Configuration Value': command

			}, (err, result) => {

				// If error, stop flow card
				if (err) {
					Homey.error(err);
					return callback(null, false);
				}

				// If properly transmitted, change the setting and finish flow card
				if (result === "TRANSMIT_COMPLETE_OK") {


					//Set the device setting to this flow value
					module.exports.setSettings(node.device_data, {
						37: command
					});

					return callback(null, true);
				}

				// no transmition, stop flow card
				return callback(null, false);
			});
		} else return callback('missing COMMAND_CLASS_CONFIGURATION');
	} else return callback('invalid_device');

});

/**
 * Flow action handler to enable random colour mode.
 */
Homey.manager('flow').on('action.zw098_random', (callback, args) => {
	if (args && args.device && args.device.token && args.speed && args.fadeType && args.cycles) {

		// Map speed 100 - 0 to 0 - 254
		args.speed = Math.round(map(100, 0, 0, 254, args.speed));

		// Get fadeType as integer
		args.fadeType = parseInt(args.fadeType);

		// Round cycles
		args.cycles = Math.round(args.cycles);

		const node = module.exports.nodes[args.device.token];

		if (node.instance.CommandClass['COMMAND_CLASS_CONFIGURATION']) {

			const command = createColourCommand(3, args.fadeType, args.cycles, args.speed, 5);

			//Send parameter values to module
			node.instance.CommandClass['COMMAND_CLASS_CONFIGURATION'].CONFIGURATION_SET({
				"Parameter Number": 37,
				"Level": {
					"Size": 4,
					"Default": false
				},
				'Configuration Value': command

			}, (err, result) => {

				// If error, stop flow card
				if (err) {
					Homey.error(err);
					return callback(null, false);
				}

				// If properly transmitted, change the setting and finish flow card
				if (result === "TRANSMIT_COMPLETE_OK") {


					//Set the device setting to this flow value
					module.exports.setSettings(node.device_data, {
						37: command
					});

					return callback(null, true);
				}

				// no transmition, stop flow card
				return callback(null, false);
			});
		} else return callback('missing COMMAND_CLASS_CONFIGURATION');
	} else return callback('invalid_device');

});

/**
 * Create a color command for the LED Bulb
 * @param colourDisplayCycle (0 = Single Colour Mode, 1 = Rainbow Mode, 2 = Multi Colour Mode), 3 = Random Mode, 15 = Inactive (keep the current configuration values)
 * @param colourTransitionStyle (0 = Smooth Colour Transition, 1 = Fast/Direct Colour Transition, 2 = Fade Out Fale In Transition, 3 = Inactive)
 * @param cycleCount (0 = Unlimited, 1 to 254 = Total number of repetitions/cycles before stopping, 255 = Inactive)
 * @param colourChangeSpeed (0 to 254 = 0 is the slowest and 254 is the fastest, 255 = Inactive)
 * @param colourResidenceTime (0 to 254 = Corresponds from 0 to 25.4 seconds, 255 = Inactive)
 */
function createColourCommand(colourDisplayCycle, colourTransitionStyle, cycleCount, colourChangeSpeed, colourResidenceTime) {
	return new Buffer([getDecimalValueFromArrays(colourTransitionStyle, 2, colourDisplayCycle, 4, true), cycleCount, colourChangeSpeed, colourResidenceTime]);
}

/**
 * Take a decimal value and size,
 * and return an binary array.
 * @param number
 * @param size
 * @returns {Array|*}
 */
function numberToBinaryArray(number, size) {
	number = (number).toString(2);
	const numbers = number.split('');

	numbers.forEach(x => {
		x = parseInt(x);
	});

	// Check if array has correct size
	if (numbers.length !== size) {
		for (let i = 0; i < size; i++) {

			// Check if 0 prepend is needed to fill
			if (numbers.length < size) {
				numbers.unshift('0');
			} else break;
		}
	}
	return numbers;
}

/**
 * Get decimal value of binary array.
 * @param arr
 * @returns {*}
 */
function getDecimalValue(arr) {
	if (!arr) return new Error('no array provided');
	let binaryString = '';
	arr.forEach(item => {
		binaryString += item;
	});
	return parseInt(binaryString, 2);
}

/**
 * Get decimal value after adding binary values.
 * @param value1
 * @param value2
 * @returns {*}
 */
function getDecimalValueFromArrays(value1, size1, value2, size2, fillPos5And4) {
	if (fillPos5And4) {
		return getDecimalValue(numberToBinaryArray(value1, size1)
			.concat(['0', '0'].concat(numberToBinaryArray(value2, size2))));
	}
	return getDecimalValue(numberToBinaryArray(value1, size1)
		.concat(numberToBinaryArray(value2, size2)));
}

/**
 * Map a range of values to a different range of values
 * @param inputStart
 * @param inputEnd
 * @param outputStart
 * @param outputEnd
 * @param input
 * @returns {*}
 */
function map(inputStart, inputEnd, outputStart, outputEnd, input) {
	return outputStart + ((outputEnd - outputStart) / (inputEnd - inputStart)) * (input - inputStart);
}
