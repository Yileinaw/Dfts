import http from '../http';
import type { User } from '../types/models';

// Define the type for the data expected by the update endpoint
interface UpdateProfileData {
  nickname?: string;
  name?: string;
  // Add other updatable fields here if needed
  // e.g., bio?: string;
}

export const UserService = {
  /**
   * Update the current user's profile information.
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    // Use PUT request to /users/profile endpoint
    const response = await http.put<User>('/users/profile', data);
    return response.data; // Return the updated user data from the backend
  }
}; 