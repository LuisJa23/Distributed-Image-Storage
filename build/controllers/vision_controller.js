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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vision_service_1 = require("../services/vision_service");
const multer_config_js_1 = __importDefault(require("../config/multer_config.js"));
const router = (0, express_1.Router)();
router.post('/landmark', multer_config_js_1.default.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Por favor, sube una imagen.' });
            return;
        }
        const result = yield (0, vision_service_1.detectLandmark)(req.file.path);
        res.json({ landmark: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.post('/labels', multer_config_js_1.default.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Por favor, sube una imagen.' });
            return;
        }
        const result = yield (0, vision_service_1.detectLabels)(req.file.path);
        res.json({ labels: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
