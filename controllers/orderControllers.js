const orderModel = require("../models/orderModel");

exports.getAllOrders = async function (req, res) {
  try {
    const orders = await orderModel.find({});
    return res.status(200).json({
      success: true,
      results: orders.length,
      data: {
        orders,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

exports.getOrder = async function (req, res) {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

exports.createOrder = async function (req, res) {
  try {
    const { order: body } = req.body;
    const total_price = body.items?.reduce((prev, curr) => {
      prev += curr.price;
      return prev;
    }, 0);

    const order = await orderModel.create({
      items: body.items,
      total_price,
    });

    return res.status(201).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }
};

exports.updateOrder = async function (req, res) {
  try {
    const { orderId } = req.params;
    const { order: body } = req.body;
    if (!body) {
      return res.status(400).json({
        success: false,
        message: "Bad request!",
      });
    }
    const { state } = body;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    if (!state) {
      return res.status(400).json({
        success: false,
        message: "Bad request! Only the state can be modified!",
      });
    }

    if (state < order.state) {
      return res.status(422).json({
        success: false,
        message: "Invalid operation!",
      });
    }

    order.state = state;

    await order.save();

    return res.status(200).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

exports.deleteOrder = async function (req, res) {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    await orderModel.deleteOne({ _id: orderId });

    return res.status(204).json({
      success: true,
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};
