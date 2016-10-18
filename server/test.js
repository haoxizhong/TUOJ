var Git = require("nodegit");

Git.Clone("https://git.coding.net/u/Chenyao2333/p/ExampleProblem_1.git", "prob").then(function(repository) {
  
},(err)=>{console.log(err)});