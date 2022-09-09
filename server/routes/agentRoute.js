const express = require("express")
const router = express.Router()

const agent = require("../controllers/agentController")
const { searchListings, addNewListing,
    removeListing, updateListing } = require('../controllers/propertiesController')


// router.patch("/updatedata", agent.updateAgentData)
// router.get("/find", agent.getAllAgents)
router.post("/listing/add", addNewListing)
router.delete("/listing/remove", removeListing)
router.get("/listing/find", searchListings)
router.patch("/listing/update", updateListing)
// router.post("/appointment/book", agent.bookAppointment)

module.exports = router;