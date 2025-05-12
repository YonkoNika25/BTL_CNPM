import api from '../utils/api';

export const getAllUsers = async(limit, offset) => {
    try{
        const params = {};
        if(limit) params.limit = limit;
        if(offset) params.offset = offset;
        const response = await api.get('/users', {params});
        return response.data;
    }
    catch(error)
    {
        throw error.response?.data?.message || "Failed to get all users";
    }
}
export const getStudents = async(limit, offset) => {
    try{
        const params = {};
        if(limit) params.limit = limit;
        if(offset) params.offset = offset;
        const response = await api.get('/users/students', {params});
        return response.data;
    }
    catch(error)
    {
         throw error.response?.data?.message || "Failed to get students";
    }
}

export const getTeachers = async(limit, offset) => {
    try{
        const params = {};
        if(limit) params.limit = limit;
        if(offset) params.offset = offset;
        const response = await api.get('/users/teachers', {params});
        return response.data;
    }
    catch(error)
    {
         throw error.response?.data?.message || "Failed to get teachers";
    }
}
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get user';
  }
};
export const createUser = async(userData) => {
    try{
        const response = await api.post('/users', userData);
        return response.data;
    }
    catch(error)
    {
        throw error.response?.data?.message || "Failed to create user";
    }
}
export const updateUser = async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update user';
    }
  };

  export const deleteUser = async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete user';
    }
  };