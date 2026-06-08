const settingService = require('../services/settingService');

const getAll = async (req, res) => {
  try {
    const settings = await settingService.getAllSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await settingService.updateSetting(key, value);
    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, update };