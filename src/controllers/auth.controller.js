import logger from '#config/logger.js';
import { authenticateUser, createUser } from '#services/auth.service.js';
import { formatValidationErrors } from '#utils/format.js';
import { jwtToken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';
import { signInSchema, signUpSchema } from '#validations/auth.validation.js';

export const signUp = async (request, response, next) => {
  try {
    const validationResult = signUpSchema.safeParse(request.body);
    if (!validationResult.success) {
      return response.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    // Auth Service
    const user = await createUser({ name, email, password, role });

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(response, 'token', token);

    logger.info('User registered successfully', email);

    response.status(201).json({
      message: 'User registered',
      user: {
        id: 1,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Signup error', error);

    if (error.message === 'User with this email already exists') {
      return response.status(409).json({ error: 'Email already exists' });
    }

    next(error);
  }
};

export const signIn = async (request, response, next) => {
  try {
    const validationResult = signInSchema.safeParse(request.body);

    if (!validationResult.success) {
      return response.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(response, 'token', token);

    logger.info(`User signed in successfully: ${email}`);

    response.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Sign in error', error);

    if (
      error.message === 'User not found' ||
      error.message === 'Invalid password'
    ) {
      return response.status(401).json({ error: 'Invalid credentials' });
    }

    next(error);
  }
};

export const signOut = async (request, response, next) => {
  try {
    cookies.clear(response, 'token');

    logger.info('User signed out successfully');
    response.status(200).json({
      message: 'User signed out successfully',
    });
  } catch (error) {
    logger.error('Sig out error', error);
    next(error);
  }
};
