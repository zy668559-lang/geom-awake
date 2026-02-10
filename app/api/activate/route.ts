import { NextResponse } from 'next/server';
import { validateCode } from '@/lib/activation';

export async function POST(req: Request) {
    try {
        const { code } = await req.json();
        if (!code) {
            return NextResponse.json({ error: '请输入激活码' }, { status: 400 });
        }

        const result = validateCode(code);
        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result.message }, { status: 403 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: '系统错误' }, { status: 500 });
    }
}
