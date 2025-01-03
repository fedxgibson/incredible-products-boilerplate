import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    // Check if user exists
    const checkUserResponse = await fetch(`${API_URL}/users/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const checkUserData = await checkUserResponse.json();

    if (checkUserData.exists) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user through API
    const createUserResponse = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: hashedPassword,
        name,
      }),
    });

    if (!createUserResponse.ok) {
      throw new Error('Failed to create user');
    }

    const userData = await createUserResponse.json();

    // Return only necessary user data
    return NextResponse.json({
      id: userData.id,
      email: userData.email,
      name: userData.name,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}
