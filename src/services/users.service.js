import { database } from "#config/database.js";
import logger from "#config/logger.js";
import { users } from "#models/user.model.js";
import { eq, getTableColumns } from "drizzle-orm";

export const getAllUsers = async () => {
  try {
    return await database
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
      })
      .from(users);
  } catch (error) {
    logger.error("Error getting users", error);
    throw error;
  }
};

export const getUserByID = async (id) => {
  try {
    const [user] = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    logger.error(`Error getting user by ${id}`, error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const user = await getUserByID(id);

    if (user.email && updates.email !== user.email) {
      const [email] = await database
        .select({ email: users.email })
        .from(users)
        .where(eq(users.email, updates.email))
        .limit(1);
      if (email) {
        throw new Error("User's email already exists");
      }
    }

    const updateData = {
      ...updates,
      updated_at: new Date(),
    };

    const { password, ...returningColumns } = getTableColumns(users);

    const [updateUser] = await database
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning(returningColumns);

    logger.info(`User ${updateUser.email} updated successfully`);
    return updateUser;
  } catch (error) {
    logger.error(`Error updating user`, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await getUserByID(id);

    const deletedUser = await database
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    logger.info(`User ${deleteUser.email} deleted successfully`);
    return deletedUser;
  } catch (error) {
    logger.error("Error deleting user");
    throw error;
  }
};
