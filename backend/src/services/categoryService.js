const categoryRepo = require('../repositories/categoryRepository');

const getAllCategories = () => categoryRepo.getAll();

const createCategory = async (name, description, userId) => {
  const existing = await categoryRepo.getAll();
  const duplicate = existing.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) throw new Error('Category with this name already exists');

  return categoryRepo.create({ name, description, created_by: userId, updated_by: userId });
};

module.exports = { getAllCategories, createCategory };
