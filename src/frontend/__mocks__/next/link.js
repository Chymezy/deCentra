const React = require('react');

module.exports = function Link({ children, href }) {
  return React.createElement('a', { href }, children);
}; 