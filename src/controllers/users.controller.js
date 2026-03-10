import logger from '#config/logger.js';
import {
  deleteUser,
  getAllUsers,
  getUserByID,
  updateUser,
} from '#services/users.service.js';

export const fetchAllUsers = async (request, response, next) => {
  try {
    logger.info('Getting users...');
    const allUsers = await getAllUsers();

    response.status(200).json({ count: allUsers.length, data: allUsers });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const fetchUserById = async (request, response, next) => {
  try {
    logger.info('Fetching user...');

    const { id } = request.params;

    const fetchedUser = await getUserByID(id);

    response.status(200).json({ data: fetchedUser });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const updateUserById = async (request, response, next) => {
  try {
    logger.info('Updating user...');

    const { id } = request.params;

    const updatedUser = await updateUser(id, request.body);

    response.status(200).json({ data: updatedUser });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const deleteUserById = async (request, response, next) => {
  try {
    logger.info('Deleting user...');

    const { id } = request.params;

    const deletedUser = await deleteUser(id);

    response.status(200).json({ data: deletedUser });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
