const categoryRepo = require('../repositories/categoryRepository');
const { createAuditLog } = require('../repositories/authRepository'); // ← ADD

const getAllCategories = () => categoryRepo.getAll();

const createCategory = async (name, description, userId, ip) => { // ← ADD ip
  const existing = await categoryRepo.getAll();
  const duplicate = existing.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) throw new Error('Category with this name already exists');

  const category = await categoryRepo.create({ name, description, created_by: userId, updated_by: userId });

  // Audit Logs
  await createAuditLog({
    user_id:    userId,
    action:     'CREATE_CATEGORY',
    entity:     'Category',
    entity_id:  category.id,
    old_value:  null,
    new_value:  JSON.stringify({ name, description }),
    ip_address: ip,
  });

  return category;
};

module.exports = { getAllCategories, createCategory };