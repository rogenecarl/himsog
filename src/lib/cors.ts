import { NextResponse } from 'next/server';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // For preflight OPTIONS requests
  export function handleCorsPrelight() {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  // For JSON responses with CORS
  export function jsonResponse(data: unknown, status = 200) {
    return NextResponse.json(data, { status, headers: corsHeaders });
  }