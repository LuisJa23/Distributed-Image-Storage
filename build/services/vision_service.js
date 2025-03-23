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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLabels = exports.detectLandmark = void 0;
const vision_1 = __importDefault(require("@google-cloud/vision"));
// Configuración del cliente de Google Vision
const client = new vision_1.default.ImageAnnotatorClient({
    credentials: {
        private_key: (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL
    }
});
// 🔹 Detectar puntos de referencia (Landmarks)
const detectLandmark = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const [result] = yield client.landmarkDetection(filePath);
        const landmarks = (_b = (_a = result.landmarkAnnotations) === null || _a === void 0 ? void 0 : _a.map(landmark => { var _a; return (_a = landmark.description) !== null && _a !== void 0 ? _a : 'Desconocido'; })) !== null && _b !== void 0 ? _b : [];
        if (landmarks.length === 0) {
            throw new Error('No se encontraron puntos de referencia en la imagen.');
        }
        return landmarks[0];
    }
    catch (error) {
        console.error('Error en la detección de puntos de referencia:', error);
        throw new Error('Error al analizar la imagen para detectar puntos de referencia.');
    }
});
exports.detectLandmark = detectLandmark;
// 🔹 Detectar etiquetas en la imagen
const detectLabels = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const [result] = yield client.labelDetection(filePath);
        const labels = (_b = (_a = result.labelAnnotations) === null || _a === void 0 ? void 0 : _a.map(label => { var _a; return (_a = label.description) !== null && _a !== void 0 ? _a : 'Etiqueta desconocida'; })) !== null && _b !== void 0 ? _b : [];
        if (labels.length === 0) {
            throw new Error('No se detectaron etiquetas en la imagen.');
        }
        return labels;
    }
    catch (error) {
        console.error('Error en la detección de etiquetas:', error);
        throw new Error('Error al analizar la imagen para detectar etiquetas.');
    }
});
exports.detectLabels = detectLabels;
