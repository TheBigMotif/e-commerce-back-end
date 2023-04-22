const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  try {
    // find all categories
    // be sure to include its associated Products
    const allCategories = await Product.findAll({ include: [Category, Tag] });
    res.json(allCategories);
  } catch (err) {
    res.status(400).json(err);
  }
});

// find all products
// be sure to include its associated Category and Tag data

// get one product
router.get("/:id", async (req, res) => {
  try {
    // find a single product by its `id`
    // be sure to include its associated Category and Tag data
    const product = await Product.findByPk(req.params.id, {
      include: [Category, Tag],
    });
    res.json(product);
  } catch (err) {
    res.status(400).json(err);
    console.error(err);
  }
});

// create new product
router.post("/", async (req, res) => {
  try {
    /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
    */
    const product = await Product.create(req.body);
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }
    // if no product tags, just respond
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
    console.error(err);
  }
});

// update product
router.put("/:id", async (req, res) => {
  try {
    // update product data
    await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // find all associated tags from ProductTag
    const productTags = await ProductTag.findAll({
      where: { product_id: req.params.id },
    });

    // get list of current tag_ids
    const productTagIds = productTags.map(({ tag_id }) => tag_id);
    // create filtered list of new tag_ids
    const newProductTags = req.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
    // figure out which ones to remove
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    // run both actions
    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product to be deleted
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the product
    await product.destroy();

    res.status(200).json({ message: "Product successfully deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
