const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth/auth");
const transferControllers = require("../controllers/transferController");
// Set up multer for file uploads
const multer = require("multer");
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/pics");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname); // You can customize the filename if needed
		// cb(null, new Date().toISOString() + file.originalname);
	},
});
const upload = multer({ storage: storage });

router.post("/create", auth, transferControllers.createTransfer);

router.post("/action/:transferId", auth, transferControllers.actionTransfer);
// router.post('/action/:data_id', upload.single('file'), (req, res) => {
//   // Access form fields and uploaded file using req.body and req.file

//   console.log(req.files); // Contains the uploaded file details

//   // Your logic to handle the data and file
//   // ...

//   // Send a response
//   res.json({ success: true, message: 'Transfer submitted successfully' });

// });

router.put(
	"/action/edit/:transferId",
	auth,
	transferControllers.editActionTransfer
);

router.put("/update/:transferId", auth, transferControllers.updateTransfer);

router.delete("/delete/:transferId", auth, transferControllers.deleteTransfer);

router.get("/:transferId", auth, transferControllers.getTransfer);

router.get("/transfers/:companyId", auth, transferControllers.getTransfers);

router.post("/finish/:transferId", auth, transferControllers.finishTransfer);

// router.patch("/:id/edit_info", usersControllers.editInfo);

module.exports = router;
