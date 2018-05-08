'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// http://www.pepper1.net/zwavedb/device/781
// http://www.zwaveproducts.com/product-documentation/AeonLabs-ZW062-A1_manual.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		locked: {
			command_class: 'COMMAND_CLASS_BARRIER_OPERATOR',
			command_get: 'BARRIER_OPERATOR_GET',
			command_report: 'BARRIER_OPERATOR_REPORT',
			command_report_parser: report => report['State'] !== 'Closed',
			command_set: 'BARRIER_OPERATOR_SET',
			command_set_parser: input => ({
				'Target Value': (input) ? 'OPEN' : 'CLOSE',
			}),
		},
	},
	settings: {
		"32": {
			index: 32,
			size: 1,
		},
		"34": {
			index: 34,
			size: 1,
		},
		"371": {
			index: 37,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(input),
				Number(newSettings["372"]),
				Number(newSettings["373"]),
				Number(newSettings["374"]),
			]),
		},
		"372": {
			index: 37,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["371"]),
				Number(input),
				Number(newSettings["373"]),
				Number(newSettings["374"]),
			]),
		},
		"373": {
			index: 37,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["371"]),
				Number(newSettings["372"]),
				Number(input),
				Number(newSettings["374"]),
			]),
		},
		"374": {
			index: 37,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["371"]),
				Number(newSettings["372"]),
				Number(newSettings["373"]),
				Number(input),
			]),
		},
		"381": {
			index: 38,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(input),
				Number(newSettings["382"]),
				Number(newSettings["383"]),
				Number(newSettings["384"]),
			]),
		},
		"382": {
			index: 38,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["381"]),
				Number(input),
				Number(newSettings["383"]),
				Number(newSettings["384"]),
			]),
		},
		"383": {
			index: 38,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["381"]),
				Number(newSettings["382"]),
				Number(input),
				Number(newSettings["384"]),
			]),
		},
		"384": {
			index: 38,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["381"]),
				Number(newSettings["382"]),
				Number(newSettings["383"]),
				Number(input),
			]),
		},
		"391": {
			index: 39,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(input),
				Number(newSettings["392"]),
				Number(newSettings["393"]),
				Number(newSettings["394"]),
			]),
		},
		"392": {
			index: 39,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["391"]),
				Number(input),
				Number(newSettings["393"]),
				Number(newSettings["394"]),
			]),
		},
		"393": {
			index: 39,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["391"]),
				Number(newSettings["392"]),
				Number(input),
				Number(newSettings["394"]),
			]),
		},
		"394": {
			index: 39,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["391"]),
				Number(newSettings["392"]),
				Number(newSettings["393"]),
				Number(input),
			]),
		},
		"401": {
			index: 40,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(input),
				Number(newSettings["402"]),
				Number(newSettings["403"]),
				Number(newSettings["404"]),
			]),
		},
		"402": {
			index: 40,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["401"]),
				Number(input),
				Number(newSettings["403"]),
				Number(newSettings["404"]),
			]),
		},
		"403": {
			index: 40,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["401"]),
				Number(newSettings["402"]),
				Number(input),
				Number(newSettings["404"]),
			]),
		},
		"404": {
			index: 40,
			size: 4,
			parser: (input, newSettings) => new Buffer([
				Number(newSettings["401"]),
				Number(newSettings["402"]),
				Number(newSettings["403"]),
				Number(input),
			]),
		},
		"80": {
			index: 80,
			size: 1,
		},
		"241": {
			index: 241,
			size: 4,
			parser: input => {
				if (input) return new Buffer([85, 85, 85, 1]);
				return new Buffer([0, 0, 0, 0]);
			},
		},
	},
});
