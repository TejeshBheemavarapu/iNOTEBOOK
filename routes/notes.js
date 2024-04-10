const express = require("express");
const User = require("../modules/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notes = require("../modules/Notes");
const fetchuser = require("../middleware/fetchuser");
const { body, matchedData, validationResult } = require("express-validator");

// Route:1 Get All the Notes using :Get "/api/notes/fetchallnotes" , Login requires

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });

    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error ");
  }
});
// Route:2 Adda a new notes  using :Post "/api/notes/addnotes" , Login requires

router.post(
  "/addnotes",
  [
    body("title", "Enter a valid title").isLength({ min: 5 }),
    body("description", "Description must be atleast 5 charactor").isLength({
      min: 5,
    }),
  ],
  fetchuser,
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();

      res.json(saveNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("internal server error ");
    }
  }
);
// Route:3 Update Note  using :PUT "/api/notes/updatenotes" , Login requires
router.put("/updatenotes/:id", fetchuser, async (req, res) => {
  //Create a newNOtes Object
  try {
    const { title, description, tag } = req.body;
    const newNotes = {};

    if (title) {
      newNotes.title = title;
    }
    if (title) {
      newNotes.description = description;
    }
    if (title) {
      newNotes.tag = tag;
    }
    //Find the NOte to be update and update it

    let notes = await Notes.findById(req.params.id);

    if (!notes) {
      res.status(404).send("Not Found");
    }
    if (notes.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    notes = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNotes },
      { new: true }
    );
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("internal server error ");
  }
});
// Route:4 Delete Note using :delete "/api/notes/deletenotes" , Login requires
router.delete("/deletenotes/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    //Find the NOte to be delete and delete it

    let notes = await Notes.findById(req.params.id);
    // console.log(notes.user)
    // fi
    if (!notes) {
      res.status(404).send("Not Found");
    }
    // Allow deletion only if user owns this before
    if (notes.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    notes = await Notes.findOneAndDelete(req.params.id);
    res.json({ Success: "Note has been delete" , notes:notes});
  } catch (error) {
    console.error(error.message);
   return res.status(500).send("internal server error ");
  }
});

module.exports = router;
