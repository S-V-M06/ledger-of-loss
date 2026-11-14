import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/pg';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters in length.' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existing = await query('SELECT user_id FROM users WHERE email = $1', [trimmedEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt cost 10
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into PostgreSQL (default role is 'user')
    const insertRes = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING user_id, name, email, role;`,
      [name.trim(), trimmedEmail, passwordHash]
    );

    const newUser = insertRes.rows[0];

    // Initialize user_risk_summary row
    await query(
      `INSERT INTO user_risk_summary (user_id, total_exposures, high_count, critical_count, overall_score)
       VALUES ($1, 0, 0, 0, 0)
       ON CONFLICT (user_id) DO NOTHING;`,
      [newUser.user_id]
    );

    // Log signup to MongoDB audit_logs
    await logAuditEvent({
      event_type: 'signup',
      user_id: newUser.user_id,
      role: 'user',
      details: { email: newUser.email, name: newUser.name },
    });

    // Generate JWT token
    const token = await signToken({
      userId: newUser.user_id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        message: 'Account successfully registered.',
        user: {
          userId: newUser.user_id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    // Set httpOnly secure session cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating your account.' },
      { status: 500 }
    );
  }
}
