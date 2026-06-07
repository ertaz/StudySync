const profileService = require('../services/profileService');

/**
 * GET /api/profile/me
 * Returns the full profile of the currently authenticated user.
 */
const getMyProfile = async (req, res) => {
  try {
    const profile = await profileService.getMyProfile(req.user.id);
    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Server error.',
    });
  }
};

/**
 * PUT /api/profile/me
 * Updates the profile of the currently authenticated user.
 * Role is taken from the verified JWT — not from request body.
 */
const updateMyProfile = async (req, res) => {
  try {
    const updated = await profileService.updateMyProfile(
      req.user.id,
      req.user.role,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data:    updated,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Server error.',
    });
  }
};

module.exports = { getMyProfile, updateMyProfile };