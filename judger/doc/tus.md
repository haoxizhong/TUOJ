TUOJ Judge Script
===
# General
TUS is a script language usually stored as a JS object or a JSON file.

It defines how the judge clients compile the code, run the program, judge the answer and return a score.
# Logic
A TUS script is an array of objects. Each object stands for an action. Those actions will be conducted in order.
# General formats
	{ cmd: String, haltOnFail: Bool }

Currently, `cmd` can be one of the followings: `compile`, `exec`, `judge`, `score`.

`haltOnFail` specifics whether the judge process ends if this operation fails.
# Command arguments
## compile
	{ 
		cmd: "compile", 
		langs: [ { 
			name: String, 
			args: String 
		} ] 
	}

TUS supports multiple language submissions using the same TUS script by regarding `langs` as an array.
## exec
	{ 
		cmd: "exec", 
		timeLimit: Number,
		// also: timeLimit: { lang: Number },
		memLimit: Number,
		// also: memLimit: { lang: Number },
		args: String,
		// also: args: { lang: String },
		inputFile: String,
		// also: [ String ]
	}

Time limit will be indicated by `MS` while memory limit indicated by `MB`.

If they are not specificed ( also for a language ), it will be set as default.
## judge
	{
		cmd: "judge",
		type: "default", // also "float", "spj" (temporarily not supported)
		args: String,
		spjId: String // not used 
		stdOutputFile: String, 
		// also: [ String ]
	}

Judge allows comparing user output and standard output.

Each judge action will generate a float between 0 and 1.

It is strictly required that the input file of a `judge` action judges the result of the last `exec` action.

If the last `exec` action fails, the result of `judge` will automatically be `0`.

`judge` actions will be numbered from `0` to `n` in convenience of `score` action.
## score
	{
		cmd: "score",
		compoments: [{
			fullScore: Number,
			logic: Number
			// also array and object combinations of $and, $or, $sum
			// currently, objects and arrays are not supported
		}]
	}

Generally, there is only one `score` in the end. It depends on results of `judge` actions.

It returns the score of this judge request. 

