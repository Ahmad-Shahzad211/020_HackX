import { NextRequest, NextResponse } from 'next/server';
import passport from '@/utils/passport';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const scope = ['profile', 'email'];

    // Use environment variable for redirect URI or construct from request
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope.join(' '))}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google authentication' },
      { status: 500 }
    );
  }
} 