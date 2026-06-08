const settingRepo = require('../repositories/settingRepository');

const getAllSettings = () => settingRepo.getAll();

const getSettingByKey = async (key) => {
  const setting = await settingRepo.getByKey(key);
  if (!setting) throw { status: 404, message: `Setting '${key}' not found` };
  return setting;
};

const updateSetting = async (key, value) => {
  const setting = await settingRepo.getByKey(key);
  if (!setting) throw { status: 404, message: `Setting '${key}' not found` };
  await settingRepo.update(key, value);
  return settingRepo.getByKey(key);
};

module.exports = { getAllSettings, getSettingByKey, updateSetting };