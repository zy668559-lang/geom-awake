import fs from 'fs';
import path from 'path';

const ACTIVATIONS_FILE = path.join(process.cwd(), 'data', 'activations.json');
const LOGS_FILE = path.join(process.cwd(), 'data', 'activation-logs.json');

export type Activation = {
    code: string;
    validUntil: string;
    isUsed: boolean;
};

export type ActivationLog = {
    code: string;
    timestamp: string;
    status: 'SUCCESS' | 'EXPIRED' | 'INVALID';
};

function readActivations(): Activation[] {
    if (!fs.existsSync(ACTIVATIONS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ACTIVATIONS_FILE, 'utf-8'));
}

function writeActivations(data: Activation[]) {
    fs.writeFileSync(ACTIVATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function logActivation(code: string, status: ActivationLog['status']) {
    const logs: ActivationLog[] = fs.existsSync(LOGS_FILE) ? JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8')) : [];
    logs.push({ code, timestamp: new Date().toISOString(), status });
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
}

export function validateCode(code: string): { success: boolean; message: string } {
    const activations = readActivations();
    const entry = activations.find(a => a.code === code);

    if (!entry) {
        logActivation(code, 'INVALID');
        return { success: false, message: '无效的激活码' };
    }

    if (new Date(entry.validUntil) < new Date()) {
        logActivation(code, 'EXPIRED');
        return { success: false, message: '激活码已过期' };
    }

    // 对于 MVP2，我们允许重复使用激活码作为“许可证”，或者标记为已使用
    // 这里简单起见，仅验证有效期
    logActivation(code, 'SUCCESS');
    return { success: true, message: '激活成功' };
}
