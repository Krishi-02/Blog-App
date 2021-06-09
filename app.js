var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");


mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost/blog_app", {useNewUrlParser: true,
useCreateIndex: true
}).then(() =>{
	console.log("connected to db!");	
}).catch(err => {
	console.log("ERROR: " + err.message);
});


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//Mongoose model config
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//restfull route config
app.get("/", function(req, res){
	res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log("error!");
		}
		else{
			res.render("index", {blogs: blogs});
		}
	});
});

//NEW ROUTE
app.get("/blogs/new", function(req, res){
	res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newblog){
		if(err){
			res.render("new");
		}
		else{
			res.redirect("/blogs");
		}
	});
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundblog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("show", {blog: foundblog});
		}
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundblog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("edit", {blog: foundblog});
		}
	});
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedblog){
		if(err)
			{
				res.redirect("/blogs");
			}
		else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs");
		}
	});
});

app.listen(3000, function(){
	console.log("Server started!");
});
