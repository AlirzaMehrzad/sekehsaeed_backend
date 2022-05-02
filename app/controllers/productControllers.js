const productModel = require("../models/productModel");

//filter , sorting, pagination
class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObj = { ...this.queryString }; // queryString = req.query

    const excludedFields = ["page", "sort", "limit"];
    excludedFields.forEach((e1) => delete queryObj[e1]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lt|lte|regex)\b/g,
      (match) => "$" + match
    );

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

const productControll = {
  getProducts: async (req, res) => {
    try {
      const features = new APIfeatures(productModel.find(), req.query)
        .filtering()
        .sorting()
        .paginating();

      const products = await features.query;

      res.status(201).send({
        status: "success",
        result: products.length,
        products: products,
      });
    } catch (error) {
      return res.status(500).send({ err: error.message });
    }
  },

  getOneProduct: async (req, res) => {
    try {
      const product = await productModel.findById(req.params.id);
      if (!product) {
        return res.status(404).send({
          status: "fail",
          message: "Product not found",
        });
      }
      res.status(201).send({
        status: "success",
        product: product,
      });
    } catch (error) {
      return res.status(500).send({ err: error.message });
    }
  },

  createProducts: async (req, res) => {
    try {
      const {
        product_id,
        title,
        price,
        description,
        content,
        images,
        category,
        stock,
      } = req.body;

      if (
        !product_id ||
        !title ||
        !price ||
        !description ||
        !content ||
        !images ||
        !category ||
        !stock
      ) {
        return res.status(400).send({
          status: "fail",
          message: "لطفا همه فیلد ها را پر کنید",
        });
      }

      const product = await productModel.findOne({ product_id });
      if (product) {
        return res.status(400).send({ message: "این محصول قبلا وجود دارد" });
      }

      const newProduct = new productModel({
        product_id,
        title,
        price,
        description,
        content,
        images,
        category,
        stock,
      });

      await newProduct.save();
      res.status(201).send({
        message: "محصول با موفقیت اضافه شد",
        newProduct,
      });
    } catch (error) {
      return res.status(500).send({ err: error.message });
    }
  },

  deleteProducts: async (req, res) => {
    try {
      await productModel.findOneAndDelete(req.params.id);
      res.status(201).send({
        message: "محصول با موفقیت حذف شد",
      });
    } catch (error) {
      return res.status(500).send({ err: error.message });
    }
  },

  updateProducts: async (req, res) => {
    try {
      const {
        product_id,
        title,
        price,
        description,
        content,
        images,
        category,
        stock,
      } = req.body;
      if (!images) {
        return res
          .status(400)
          .send({ message: "تصویری برای محصول آپلود کنید" });
      }

      await productModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          product_id,
          title,
          price,
          description,
          content,
          images,
          category,
          stock,
        }
      );

      res.status(201).send({
        message: "محصول با موفقیت بروزرسانی شد",
      });
    } catch (error) {
      return res.status(500).send({ err: error.message });
    }
  },

  refreshBasket: async (req, res) => {
    try {
      const { cart } = req.body;
      const products = await productModel.find({ _id: { $in: cart } });
      let newCart = ([...cart], products);

      // let newCart = cart.forEach((item) => {
      //   products.forEach((product) => {
      //     if (product._id === item._id) {
      //       item.price = product.price;
      //     }
      //   });
      // });
      // const newCart = cart.map((e1) => {
      //   const product = products.find((e2) => e2.product_id === e1.product_id);
      //   if (product) {
      //     return {
      //       ...e1,
      //       price: product.price,
      //     };
      //   }
      // });
      console.log(newCart);

      res.status(201).send({
        message: "سبد خرید با موفقیت بروزرسانی شد",
        newCart,
      });
    } catch (error) {
      return res.status(500).send({ err: error.message });
    }
  },
};

module.exports = productControll;
