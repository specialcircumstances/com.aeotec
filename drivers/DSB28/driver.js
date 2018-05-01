'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// http://products.z-wavealliance.org/ProductManual/File?folder=&filename=Manuals/1425/Aeon%20Labs%20Smart%20Switch%206%20manual%20(2)%20.pdf
//Aeon Labs Home Energy Meter DSB28 - Gen 2
//Product Identifier: DSB28
// EU Version / AUS Version ??
//Product Type ID: 0x0002
//Product ID: 0x0001
// US version ??
//Product Type ID: 0x0002
//Product ID: 0x001C

module.exports = new ZwaveDriver(path.basename(__dirname), {
  debug: true,
  capabilities: {
    measure_power: {
      command_class: 'COMMAND_CLASS_METER',
      command_get: 'METER_GET',
      command_get_parser: () => ({
        'Sensor Type': 'Electric meter',
        'Properties1': {
          'Scale': 2
        }
      }),
      command_report: 'METER_REPORT',
      command_report_parser: report => {
        if (report.hasOwnProperty('Properties2') &&
          report.Properties2.hasOwnProperty('Scale bits 10') &&
          report.Properties2['Scale bits 10'] === 2 &&
          report.Properties1.hasOwnProperty('Scale bit 2') &&
          report.Properties1['Scale bit 2'] === false) {
          return report['Meter Value (Parsed)'];
        }
        return null;
      }
    },
    meter_power: {
      command_class: 'COMMAND_CLASS_METER',
      command_get: 'METER_GET',
      command_get_parser: () => ({
        'Sensor Type': 'Electric meter',
        'Properties1': {
          'Scale': 0
        }
      }),
      command_report: 'METER_REPORT',
      command_report_parser: report => {
        if (report.hasOwnProperty('Properties2') &&
          report.Properties2.hasOwnProperty('Scale bits 10') &&
          report.Properties2['Scale bits 10'] === 0 &&
          report.Properties1.hasOwnProperty('Scale bit 2') &&
          report.Properties1['Scale bit 2'] === false) {
          return report['Meter Value (Parsed)'];
        }
        return null;
      }
    },
    measure_voltage: {
      command_class: 'COMMAND_CLASS_METER',
      command_get: 'METER_GET',
      command_get_parser: () => ({
        'Sensor Type': 'Electric meter',
        'Properties1': {
          'Scale': 4
        }
      }),
      command_report: 'METER_REPORT',
      command_report_parser: report => {
        if (report.hasOwnProperty('Properties2') &&
          report.Properties2.hasOwnProperty('Scale bits 10') &&
          report.Properties2['Scale bits 10'] === 0 &&
          report.Properties1.hasOwnProperty('Scale bit 2') &&
          report.Properties1['Scale bit 2'] === true) {
          return report['Meter Value (Parsed)'];
        }
        return null;
      }
    },
    measure_current: {
      command_class: 'COMMAND_CLASS_METER',
      command_get: 'METER_GET',
      command_get_parser: () => ({
        'Sensor Type': 'Electric meter',
        'Properties1': {
          'Scale': 5
        }
      }),
      command_report: 'METER_REPORT',
      command_report_parser: report => {
        if (report.hasOwnProperty('Properties2') &&
          report.Properties2.hasOwnProperty('Scale bits 10') &&
          report.Properties2['Scale bits 10'] === 1 &&
          report.Properties1.hasOwnProperty('Scale bit 2') &&
          report.Properties1['Scale bit 2'] === true ) {
          return report['Meter Value (Parsed)'];
        }
        return null;
      }
    }
  },
  settings: {
    // Energy Detection Mode for para 101 to 103
    2: {
      index: 2,
      size: 1,
    },
    // Enable/disable selective reporting only when power change reaches a
    // certain threshold or percentage
    3: {
      index: 3,
      size: 1,
    },
    // Threshold change in wattage to induce a automatic report Whole HEM
    4: {
      index: 4,
      size: 2,
    },
    // Threshold change in wattage to induce a automatic report P1
    5: {
      index: 5,
      size: 2,
    },
    // Threshold change in wattage to induce a automatic report P2
    6: {
      index: 6,
      size: 2,
    },
    // Threshold change in wattage to induce a automatic report P3
    7: {
      index: 7,
      size: 2,
    },
    // Percentage change in wattage to induce a automatic report Whole HEM
    8: {
      index: 8,
      size: 1,
    },
    // Percentage change in wattage to induce a automatic report P1
    9: {
      index: 9,
      size: 1,
    },
    // Percentage change in wattage to induce a automatic report P2
    10: {
      index: 10,
      size: 1,
    },
    // Percentage change in wattage to induce a automatic report P3
    11: {
      index: 11,
      size: 1
    },
    // To set which report need to be sent in Report group 1
    101: {
      index: 101,
      size: 4,
    },
    // To set which report need to be sent in Report group 2
    102: {
      index: 102,
      size: 4,
    },
    // To set which report need to be sent in Report group 3
    103: {
      index: 103,
      size: 4,
    },
    // Set the interval time of sending report in Report group 1.
    111: {
      index: 111,
      size: 4,
    },
    // Set the interval time of sending report in Report group 2.
    112: {
      index: 112,
      size: 4,
    },
    // Set the interval time of sending report in Report group 1.
    113: {
      index: 113,
      size: 4,
    },
    // Partner ID
    200: {
      index: 200,
      size: 1
    },
    // Enable/Disable Lock Configuration
    252: {
      index: 252,
      size: 4
    },
    // Reset to Factory Defaults
    255: {
      index: 252,
      size: 4
    },
  },
});


Homey.manager('flow').on('action.DSB28_reset_meter', (callback, args) => {
	const node = module.exports.nodes[args.device.token];

	if (node &&
		node.instance &&
		node.instance.CommandClass &&
		node.instance.CommandClass.COMMAND_CLASS_METER) {
		node.instance.CommandClass.COMMAND_CLASS_METER.METER_RESET({}, (err, result) => {
			if (err) return callback(err);

			// If properly transmitted, change the setting and finish flow card
			if (result === 'TRANSMIT_COMPLETE_OK') {
				return callback(null, true);
			}
			return callback('unknown_response');
		});
	} else return callback('unknown_error');
});
