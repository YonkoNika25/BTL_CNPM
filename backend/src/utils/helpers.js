// backend/src/utils/helpers.js

exports.formatDate = (date) => {
    // Format date to YYYY-MM-DD
    return date.toISOString().split('T')[0];
  };
  
  exports.generateRandomCode = (length) => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
  }