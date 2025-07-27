const userModel = require("../models/userModel");
const transferModel = require("../models/transferModel");

class APIfeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}
	filtering() {
		const queryObj = { ...this.queryString }; // queryString = req.query

		const excludedFields = ["page", "sort", "limit"];
		excludedFields.forEach((el) => delete queryObj[el]);

		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(
			/\b(gte|gt|lt|lt|lte|regex)\b/g,
			(match) => "$" + match
		);

		// Convert queryStr back to JSON
		let queryParam = JSON.parse(queryStr);

		// Loop through each field and modify the fields to use regex if it's not a number
		for (let field in queryParam) {
			if (isNaN(queryParam[field])) {
				queryParam[field] = { $regex: queryParam[field], $options: "i" };
			}
		}

		this.query.find(queryParam);

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
		const limit = this.queryString.limit * 1 || 9;
		const skip = (page - 1) * limit;
		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
}

const transferControll = {
	createTransfer: async (req, res, next) => {
		try {
			const {
				name,
				mobile,
				cartNumber,
				accountNumber,
				shebaNumber,
				date,
				caption,
				createdBy,
				companyId,
				price,
			} = req.body;

			const newTransfer = new transferModel({
				name,
				mobile,
				cartNumber,
				createdBy,
				accountNumber,
				shebaNumber,
				date,
				caption,
				companyId,
				price: deletePriceCommas(price),
			});
			await newTransfer.save();

			req.app
				.get("io")
				.emit("transferCreated", { companyId, transfer: newTransfer });

			res.status(201).send({
				success: true,
				message: `حواله جدید ایجاد شد`,
			});
		} catch (error) {
			next(error);
		}
	},

	actionTransfer: async (req, res, next) => {
		try {
			const { date, caption, userId, price, mobile, name } = req.body;
			const { transferId } = req.params;
			console.log("transferId", transferId);
			// if(!price || !name || !mobile){
			//   return res.status(400).send({
			//     success: false,
			//     message: "لطقا مقادیر ضروری را وارد کنید",
			//   });
			// }
			const transfer = await transferModel.findById(transferId);

			let orders = [];
			transfer.actions.map((action) => {
				orders.push(action.order);
			});
			let order = findLargestNumber(orders);

			// handle image
			let imgs = req.files;
			console.log("imgs", imgs);
			let imagePaths = [];

			for (let imgKey in imgs) {
				let img = imgs[imgKey];
				let dateN = new Date();
				let formattedDate = dateN.toISOString().replace(/:/g, "-"); // gets the date in the format YYYY-MM-DD
				let newFileName = formattedDate + "-" + img.name;

				img.mv("./uploads/pics/" + newFileName);
				let imagePath = "./uploads/pics/" + newFileName;
				imagePaths.push(imagePath); // Add this line
			}

			const user = await userModel.findById(userId);
			const newAction = {
				price: deletePriceCommas(price),
				caption: caption,
				date: new Date(),
				userName: `${user?.fname} ${user?.lname}`,
				transferedBy: userId,
				accountOwnerName: name,
				mobile: mobile,
				image: imagePaths, // Change this line
				order: order + 1,
			};

			const calcPayeds = transfer.payed + Number(deletePriceCommas(price));

			if (transfer.price - calcPayeds < 0) {
				return res.status(400).send({
					success: false,
					message: "مبلغ وارد شده ببیشتر از مبلغ کل حواله است",
				});
			}

			transfer.payed = calcPayeds;
			transfer.actions.push(newAction);
			await transfer.save();

			req.app.get("io").emit("newAction", { transfer });

			return res.status(201).send({
				success: true,
				message: "واریز با موفقیت ثبت شد",
			});
		} catch (error) {
			next(error);
		}
	},

	editActionTransfer: async (req, res, next) => {
		try {
			const { transferId } = req.params;
			const { name, mobile, price, caption, userName, actionOrder, date } =
				req.body;

			const transfer = await transferModel.findById(transferId);

			let oldAction;
			transfer.actions.map(async (action, index) => {
				if (action.order == actionOrder) {
					oldAction = action;
					transfer.actions[index] = {
						...oldAction,
						price: deletePriceCommas(price),
						caption: caption,
						accountOwnerName: name,
						date: new Date(date),
					};

					await transfer.save();
				}
			});
			// const oldAction = transfer.actions[`${actionOrder}`]

			const Price = deletePriceCommas(Number(price));
			const OldActionPrice = Number(oldAction.price);

			if (Price > OldActionPrice) {
				const caclDiff = Price - OldActionPrice;
				const newPayed = transfer.payed + caclDiff;

				await transferModel.findOneAndUpdate(
					{ _id: transferId },
					{ payed: newPayed }
				);
			}

			if (Price < OldActionPrice) {
				const caclDiff = OldActionPrice - Price;
				const newPayed = transfer.payed - caclDiff;
				console.log("newPAYED", newPayed);
				await transferModel.findOneAndUpdate(
					{ _id: transferId },
					{ payed: newPayed }
				);
			}

			// transfer.actions[`${actionOrder}`] = {
			//   ...oldAction,
			//   price: price,
			//   caption: caption,
			//   accountOwnerName: name,
			//   date: new Date(date)
			// }

			// await transfer.save()
			req.app.get("io").emit("editAction", { transfer });

			return res.status(201).send({
				success: true,
				message: "ثبت شد",
			});
		} catch (error) {
			next(error);
		}
	},

	finishTransfer: async (req, res, next) => {
		try {
			const { transferId } = req.params;
			const { isFinished, isAddedTosystem } = req.body;

			await transferModel.findByIdAndUpdate(
				{ _id: transferId },
				{ finished: isFinished, addedToSystem: isAddedTosystem }
			);

			return res.status(201).send({
				success: true,
				message: "ثبت شد",
			});
		} catch (error) {
			next(error);
		}
	},

	updateTransfer: async (req, res, next) => {
		try {
			const { transferId } = req.params;
			const {
				name,
				mobile,
				cartNumber,
				accountNumber,
				shebaNumber,
				date,
				caption,
				createdBy,
				price,
			} = req.body;

			const transfer = await transferModel.findOneAndUpdate(
				{ _id: transferId },
				{
					name,
					mobile,
					cartNumber,
					createdBy,
					accountNumber,
					shebaNumber,
					date,
					caption,
					price: deletePriceCommas(price),
				}
			);

			req.app.get("io").emit("updateTransfer", { transfer });

			res.status(201).send({
				success: true,
				message: "حواله با موفقیت بروزرسانی شد",
			});
		} catch (error) {
			next(error);
		}
	},

	deleteTransfer: async (req, res, next) => {
		try {
			const { transferId } = req.params;
			const transfer = await transferModel.findByIdAndUpdate(
				{ _id: transferId },
				{ deleted: true }
			);

			req.app.get("io").emit("deleteTransfer", { transfer });

			res.status(201).send({
				success: true,
				message: "حواله با موفقیت حذف شد",
			});
		} catch (error) {
			next(error);
		}
	},

	getTransfer: async (req, res, next) => {
		try {
			const { transferId } = req.params;
			const transfer = await transferModel.findById(transferId);
			res.status(201).send({
				success: true,
				transfer,
			});
		} catch (error) {
			next(error);
		}
	},

	getTransfers: async (req, res, next) => {
		try {
			const { limit, page, dateFilter, name, isFinished, isDeleted } =
				req.query;
			const { companyId } = req.body;

			console.log("🔍 Raw query params:", req.query);
			console.log("🏢 Company ID:", companyId);

			let queryFilter = { companyId };

			// Handle finished
			if (isFinished === "true") queryFilter.finished = true;
			else if (isFinished === "false") queryFilter.finished = false;

			// Handle deleted
			if (isDeleted === "true") queryFilter.deleted = true;
			else if (isDeleted === "false") queryFilter.deleted = false;
			else queryFilter.deleted = false; // Default

			// Handle date filter
			if (dateFilter) {
				let sentDate = new Date(dateFilter);
				sentDate.setHours(0, 0, 0, 0);

				let nextDay = new Date(sentDate);
				nextDay.setDate(nextDay.getDate() + 1);

				queryFilter.date = { $gte: sentDate, $lt: nextDay };
			} else if (!name) {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const tomorrow = new Date(today);
				tomorrow.setDate(tomorrow.getDate() + 1);

				queryFilter.date = { $gte: today, $lt: tomorrow };
			}

			console.log("🧾 Final query filter:", queryFilter);

			const baseQuery = transferModel.find(queryFilter);

			const features = new APIfeatures(baseQuery, req.query)
				.filtering()
				.sorting()
				.paginating();

			const transfers = await features.query;

			console.log("✅ Found transfers:", transfers.length);

			res.status(201).send({
				success: true,
				transfers,
			});
		} catch (error) {
			console.error("❌ Error in getTransfers:", error);
			next(error);
		}
	},
};

function findLargestNumber(array) {
	if (array.length === 0) {
		return 1;
	}
	let largest = array[0];
	for (let i = 1; i < array.length; i++) {
		if (array[i] > largest) {
			largest = array[i];
		}
	}
	return largest;
}

function deletePriceCommas(price) {
	if (typeof price !== "string") {
		price = price.toString();
	}
	const p = price.replace(/,/g, "");
	return p;
}

module.exports = transferControll;
