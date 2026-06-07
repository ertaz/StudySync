const { Permission, RolePermission, UserRole } = require('../models');

/**
 * Usage in any route:
 *   router.post('/courses', verifyToken, checkPermission('course:create'), createCourse);
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
      }

      // Get all roles this user has
      const userRoles = await UserRole.findAll({ where: { user_id: userId } });
      const roleIds   = userRoles.map(ur => ur.role_id);

      if (!roleIds.length) {
        return res.status(403).json({ success: false, message: 'No roles assigned.' });
      }

      // Find the required permission record
      const permission = await Permission.findOne({
        where: { name: requiredPermission },
      });
      if (!permission) {
        // If permission doesn't exist in DB, block access
        return res.status(403).json({
          success:  false,
          message:  `Permission '${requiredPermission}' is not defined.`,
        });
      }

      // Check if any of the user's roles has this permission
      const hasIt = await RolePermission.findOne({
        where: {
          role_id:       roleIds,
          permission_id: permission.id,
        },
      });

      if (!hasIt) {
        return res.status(403).json({
          success:  false,
          message:  'Access denied: insufficient permissions.',
        });
      }

      next();
    } catch (err) {
      console.error('[checkPermission]', err.message);
      res.status(500).json({ success: false, message: 'Permission check failed.' });
    }
  };
};

module.exports = checkPermission;