const Announcement = require("../models/Announcement");

const getAllAnnouncements = async (req, res, next) => {
  const user = req.user;
  const announcementArr = await Announcement.find({});
  req.announcementArr = announcementArr;
  next();
};

module.exports = {
  getAllAnnouncements,
};
