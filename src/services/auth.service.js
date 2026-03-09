import bcrypt from 'bcrypt';
import logger from '#config/logger.js';
import { database } from '#config/database.js';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model.js';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Invalid password', error);
    throw new Error('Error hassing');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error(`Error comparting password: ${error}`);
    throw new Error('Error comparing password');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await database
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    const password_hash = await hashPassword(password);
    const [newUser] = await database
      .insert(users)
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    logger.info(`User ${newUser.email} created successfully`);

    return newUser;
  } catch (error) {
    logger.error('Error creating the user', error);
    throw error;
  }
};

/*
  Drizzle ORM's .returning() Design
  The .returning() method uses a column selection object pattern for a few key reasons:
  1. It mirrors the query builder's type system
  Drizzle is built around typed SQL column references, not string field names. users.email isn't just a string — it's a typed column object that carries metadata like the column's SQL name, data type, and table it belongs to. This is what allows Drizzle to infer the return type correctly.

  // users.email is actually something like:
  // Column<{ tableName: "users", name: "email", dataType: "string", ... }>
*/

export const authenticateUser = async ({ email, password }) => {
  try {
    const [existingUser] = await database
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const isPasswordValid = await comparePassword(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    logger.info(`User ${existingUser.email} authenticated successfully`);

    return {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      created_at: existingUser.created_at,
    };
  } catch (error) {
    logger.error(`Error authenticating user: ${error}`);
    throw error;
  }
};
