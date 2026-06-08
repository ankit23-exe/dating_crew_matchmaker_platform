import { NextResponse } from 'next/server';

const backendBase = () =>
  (process.env.BACKEND_URL || 'http://localhost:5001').replace(/\/$/, '');

const TOKEN_COOKIE = 'tdc_matchmaker_token';

async function proxyRequest(
  request: Request,
  pathSegments: string[],
): Promise<NextResponse> {
  const path = pathSegments.join('/');
  const url = `${backendBase()}/api/${path}${new URL(request.url).search}`;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const cookie = request.headers.get('cookie');
  if (cookie) headers.set('Cookie', cookie);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.text() : undefined;

  const backendRes = await fetch(url, {
    method: request.method,
    headers,
    body,
  });

  const responseBody = await backendRes.text();
  const response = new NextResponse(responseBody, { status: backendRes.status });

  const backendContentType = backendRes.headers.get('content-type');
  if (backendContentType) {
    response.headers.set('Content-Type', backendContentType);
  }

  if (path === 'auth/login' && backendRes.ok) {
    const setCookie = backendRes.headers.get('set-cookie');
    const match = setCookie?.match(new RegExp(`${TOKEN_COOKIE}=([^;]+)`));
    if (match?.[1]) {
      response.cookies.set(TOKEN_COOKIE, decodeURIComponent(match[1]), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 8 * 60 * 60,
      });
    }
  }

  if (path === 'auth/logout') {
    response.cookies.set(TOKEN_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }

  return response;
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
