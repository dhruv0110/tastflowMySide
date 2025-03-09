// middleware/admin.js
const fetchUser = require('./fetchUser');

const isAdmin = (req, res, next) => {
  fetchUser(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  });
};

module.exports = isAdmin;
