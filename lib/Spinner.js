"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ora_1 = __importDefault(require("ora"));
class Spinner {
    constructor() {
        this.spinner = ora_1.default();
    }
    succeed(msg) {
        this.spinner.succeed(msg);
    }
    update(msg) {
        this.spinner.text = msg;
        this.spinner.start();
    }
    fail(msg, error) {
        this.spinner.fail(msg);
        console.error(error.message);
        process.exit(1);
    }
}
exports.default = new Spinner();
