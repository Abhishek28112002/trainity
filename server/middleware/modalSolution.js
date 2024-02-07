const ModalSolution = require("../models/ModalSolution");

const getAllModelSolutions = async (req, res, next) => {
  try {
    const modalSolutions = await ModalSolution.find({});
    req.modalSolutionsArr = modalSolutions;
  } catch (e) {
    console.log(e);
  }

  next();
};

module.exports = {
  getAllModelSolutions,
};
