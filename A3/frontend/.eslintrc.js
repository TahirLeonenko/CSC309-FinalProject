module.exports = {
  rules: {
    // Disable all warnings
    "no-warning-comments": "off",
    "no-console": "off",
    "no-debugger": "off",
    "no-unused-vars": "off",
    "react-hooks/exhaustive-deps": "off",
    // Add any other rules you want to disable
  },
  // Extend the existing configuration
  extends: [
    "react-app",
    "react-app/jest"
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  env: {
    browser: true,
    es2021: true
  }
}; 