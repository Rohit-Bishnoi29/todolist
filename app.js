//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect('mongodb+srv://Rohit:Rohit29@cluster0.w4wzq.mongodb.net/?retryWrites=true&w=majority/todolistDB');

const itemSchema = {
  name: String
};
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Welcome to your to do list"
});
const item2 = new Item({
  name: "Hit the + button to add an item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  const day = date.getDate();
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log("Error");
        }
        else {
          console.log("Sucessefuly added the document ");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  })

});

app.post("/", function (req, res) {

  const item = req.body.newItem;
  const listName = req.body.list;
  const day = date.getDate();
  const newitem = new Item({
    name: item
  });
  if (listName == day) {
    newitem.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(newitem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});
app.post("/delete", function (req, res) {
  const checked = req.body.checkbox;
  const listName = req.body.listName;
  const day = date.getDate();

  if (listName == day) {
    Item.findByIdAndRemove(checked, function (err) {
      if (!err) {
        console.log("Deleted the checked item");
      }
      res.redirect("/");
    });
 }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checked } } }, function (err, foundList) {
      if (!err) {
        //console.log("Anything");
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        res.render("list", { listTitle: customListName, newListItems: foundList.items });
      }
    }
  })
});

app.listen(process.env.PORT||3000, function () {
  console.log("Server started on port 3000");
});
