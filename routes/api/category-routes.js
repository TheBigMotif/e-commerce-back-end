const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  const allCategories = await Category.findAll({ include: [Product] });
  res.json(allCategories);
});

router.get("/:id", async (req, res) => {
  // const allCategories = await Category.findAll({include: [p]})
  // find one category by its `id` value
  // be sure to include its associated Products
  //Category.findByPk

  try {
    const categoryData = await Category.findByPk(req.params.id, {
      // JOIN with travellers, using the Trip through table
      include: [Product],
    });

    if (!categoryData) {
      res.status(404).json({ message: "No location found with this id!" });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
    console.error(err);
  }
});

router.post("/", async (req, res) => {
  // create a new category
  // Category.create()

  try {
    const categoryData = await Category.create(req.body);
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put("/:id", async (req, res) => {
  // update a category by its `id` value
  //Category.update()
  try {
    const updatedCategory = await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!updatedCategory[0]) {
      res.status(404).json({ message: "No category found with this id!" });
      return;
    }

    res.status(200).json({ message: "Category updated successfully!" });
  } catch (err) {
    res.status(500).json(err);
    console.error(err);
  }
});

router.delete("/:id", async (req, res) => {
  // delete a category by its `id` value
  // Category.destroy()
  try {
    const deletedCategory = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!deletedCategory) {
      res.status(404).json({ message: "No category found with this id!" });
      return;
    }

    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (err) {
    res.status(500).json(err);
    console.error(err);
  }
});

module.exports = router;
