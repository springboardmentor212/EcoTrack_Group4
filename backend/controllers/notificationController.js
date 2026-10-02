const getNotifications = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Notification service is connected",
      notifications: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

module.exports = {
  getNotifications,
};