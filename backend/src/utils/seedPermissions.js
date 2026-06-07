const { Permission, RolePermission, Role } = require('../models');

const allPermissions = [

  // ── AUTH
  { name: 'auth:refresh',          description: 'Refresh access token' },
  { name: 'auth:logout',           description: 'Logout from the system' },

  // ── ADMIN PANEL
  { name: 'admin:panel',           description: 'Access the Admin Panel sidebar button' },

  // ── USER MANAGEMENT
  { name: 'user:create',           description: 'Create a professor account' },
  { name: 'user:edit',             description: 'Edit a professor account' },
  { name: 'user:delete',           description: 'Delete a professor account' },
  { name: 'user:view',             description: 'View list of users/professors' },

  // ── CATEGORIES (view and create only — no edit/delete)
  { name: 'category:create',       description: 'Create a course category' },
  { name: 'category:view',         description: 'View course categories' },

  // ── COURSES
  { name: 'course:create',         description: 'Create a new course' },
  { name: 'course:edit',           description: 'Edit an existing course' },
  { name: 'course:delete',         description: 'Delete a course' },
  { name: 'course:view',           description: 'View course details and list' },

  // ── SECTIONS
  { name: 'section:create',        description: 'Create a section inside a course' },
  { name: 'section:edit',          description: 'Edit a section' },
  { name: 'section:delete',        description: 'Delete a section' },
  { name: 'section:view',          description: 'View sections of a course' },

  // ── LESSONS
  { name: 'lesson:create',         description: 'Upload/create a lesson' },
  { name: 'lesson:edit',           description: 'Edit a lesson' },
  { name: 'lesson:delete',         description: 'Delete a lesson' },
  { name: 'lesson:view',           description: 'View lesson content' },

  // ── ASSIGNMENTS
  { name: 'assignment:create',     description: 'Create an assignment' },
  { name: 'assignment:edit',       description: 'Edit an assignment' },
  { name: 'assignment:delete',     description: 'Delete an assignment' },
  { name: 'assignment:view',       description: 'View assignments' },
  { name: 'assignment:report',     description: 'View assignment reports' },

  // ── SUBMISSIONS
  { name: 'submission:create',     description: 'Submit an assignment (student)' },
  { name: 'submission:view',       description: 'View own or all submissions' },
  { name: 'submission:grade',      description: 'Grade a submission (professor/admin)' },

  // ── ENROLLMENTS (no unenroll)
  { name: 'enrollment:create',     description: 'Enroll into a course (student)' },
  { name: 'enrollment:view',       description: 'View enrolled courses' },
];

const rolePermissionMap = {

  admin: allPermissions.map(p => p.name),

  professor: [
    'auth:refresh', 'auth:logout',
    'course:view',
    'section:create', 'section:edit', 'section:delete', 'section:view',
    'lesson:create',  'lesson:edit',  'lesson:delete',  'lesson:view',
    'assignment:create', 'assignment:edit', 'assignment:delete',
    'assignment:view',   'assignment:report',
    'submission:view',   'submission:grade',
    'category:view',
    'user:view',
    'enrollment:view',
  ],

  student: [
    'auth:refresh', 'auth:logout',
    'course:view',
    'section:view',
    'lesson:view',
    'assignment:view',
    'submission:create', 'submission:view',
    'enrollment:create', 'enrollment:view',
    'category:view',
  ],
};

async function seedPermissions() {
  try {
    console.log('[Seed] Seeding Permissions and RolePermissions...');

    for (const perm of allPermissions) {
      await Permission.findOrCreate({
        where: { name: perm.name },
        defaults: { description: perm.description },
      });
    }

    for (const [roleName, permNames] of Object.entries(rolePermissionMap)) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        console.warn(`[Seed] Role '${roleName}' not found — skipping.`);
        continue;
      }

      for (const permName of permNames) {
        const permission = await Permission.findOne({ where: { name: permName } });
        if (!permission) {
          console.warn(`[Seed] Permission '${permName}' not found — skipping.`);
          continue;
        }

        await RolePermission.findOrCreate({
          where: { role_id: role.id, permission_id: permission.id },
        });
      }
    }

    console.log('[Seed] Permissions seeded successfully ✓');
  } catch (err) {
    console.error('[Seed] Error seeding permissions:', err.message);
  }
}

module.exports = seedPermissions;