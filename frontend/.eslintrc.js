module.exports = {
  // ... otras configuraciones
  rules: {
    'no-unused-vars': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
}; 