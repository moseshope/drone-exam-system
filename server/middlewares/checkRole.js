
const { ROLES } = require("../config/constants");

exports.checkRoles = (roles = [ROLES.ADMIN]) => (req, res, next) => {

  if (roles.includes(req.user.permission)) return next();

  return res.status(403).json({
    success: false,
    message: 'You do not have permission to perform this action.'
  });
}