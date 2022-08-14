// function findAgent(req, res) {
//     try {
//         Agent.findOne({ _id: req.body._id })
//             .then((response) => {
//                 if (response) {
//                     console.log(response)
//                     res.status(200).send({ message: "Agent found" })
//                 } else {
//                     res.status(404).send({ message: "Agent not found" })
//                 }
//             })
//     } catch (error) {

//     }
// }

// function findUser(req, res) {
//     try {
//         User.findOne({ _id: req.body._id })
//             .then((response) => {
//                 if (response) {
//                     console.log(response)
//                     res.status(200).send({ message: "User found" })
//                 } else {
//                     res.status(404).send({ message: "User not found" })
//                 }
//             })
//     } catch (error) {

//     }
// }
