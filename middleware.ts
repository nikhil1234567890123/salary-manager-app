import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');

    // Skip public routes (if any)
    if (request.nextUrl.pathname.startsWith('/api')) {
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: 'API access requires authorization' },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'],
};
