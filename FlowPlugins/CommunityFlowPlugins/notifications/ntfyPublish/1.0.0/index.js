"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.details = exports.plugin = void 0;
var ntfy_1 = require("../../../../FlowHelpers/1.0.0/nove/ntfy");
var utils_1 = require("../../../../FlowHelpers/1.0.0/nove/utils");
var OUT_SUCCESS = 1;
var OUT_FAIL = 2;
var details = function () { return ({
    name: 'Publish ntfy.sh Notification',
    description: 'Publish a notification through the ntfy.sh API.',
    style: {
        borderColor: 'blue',
    },
    tags: 'notifications',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    icon: 'faBell',
    inputs: [
        {
            label: 'ntfy.sh URL',
            name: 'url',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: "Specify the ntfy.sh base URL. This must point to your ntfy.sh instance.\n      Examples:\n\n      - https://ntfy.sh --- default public server\n      - http://localhost:9876 --- self-hosted ntfy.sh instance running on the same machine",
        },
        {
            label: 'Topic',
            name: 'topic',
            type: 'string',
            defaultValue: 'tdarr',
            inputUI: {
                type: 'text',
            },
            tooltip: 'The ntfy.sh topic',
        },
        {
            label: 'Message',
            name: 'message',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'textarea',
            },
            tooltip: 'The notification body',
        },
        {
            label: 'Title',
            name: 'title',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'The notification header',
        },
        {
            label: 'Priority',
            name: 'priority',
            type: 'string',
            defaultValue: 'default',
            inputUI: {
                type: 'dropdown',
                options: Object.values(ntfy_1.NtfyPriority),
            },
            tooltip: 'The notification priority',
        },
        {
            label: 'Tags',
            name: 'tags',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'A list of comma-separated tags (example: video,h265)',
        },
    ],
    sidebarPosition: -1,
    outputs: [
        {
            number: OUT_SUCCESS,
            tooltip: 'The original language was detected.',
        },
        {
            number: OUT_FAIL,
            tooltip: 'The original was not detected',
        },
    ],
}); };
exports.details = details;
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, url, topic, message, title, priority, tags, client, priorityResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                url = String(args.inputs.url).trim();
                topic = String(args.inputs.topic).trim();
                message = String(args.inputs.message).trim();
                title = String(args.inputs.title).trim();
                priority = String(args.inputs.priority).trim();
                tags = String(args.inputs.tags).trim();
                client = new ntfy_1.NtfyClient(url);
                priorityResult = (0, utils_1.enumParser)(ntfy_1.NtfyPriority)(priority);
                if (!priorityResult.ok) {
                    throw new Error("Invalid priority value: ".concat(priority));
                }
                if (!message) {
                    throw new Error('An empty message is not allowed');
                }
                return [4 /*yield*/, client.publish(topic, {
                        body: message,
                        tags: tags ? tags.split(',') : undefined,
                        priority: priorityResult.value,
                        title: title,
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: OUT_SUCCESS,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
