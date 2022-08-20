const express = require("express")
const router = express.Router()

const agent = require("../controllers/agentController")

router.post("/register", agent.addNewAgent)
router.post("/updatedata", agent.updateAgentData)

module.exports = router;