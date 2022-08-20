const express = require("express")
const router = express.Router()

const agent = require("../controllers/agentController")


router.post("/register", agent.addNewAgent)
router.patch("/updatedata", agent.updateAgentData)
router.get("/find", agent.getAll)

module.exports = router;