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
        sourceId: Number, // from 0 to x-1
		langs:  {
            name: {
			    args: String 
            }
		} 
	}

TUS supports multiple language submissions using the same TUS script by regarding `langs` as an array.
## exec
	{ 
		cmd: "exec", 
		binId: Number,
		timeLimit: Number,
		// also: timeLimit: { lang: Number },
		memLimit: Number,
		// also: memLimit: { lang: Number },
		args: String,
		// also: args: { lang: String },
		inputFile: String,
		// also: [ String ]
	}

`binId` indicates which target will be executed. (Numbered from 0)

Note that targets of `compile` and `exec` are all numbered according to its position in the whole script since 0.

Time limit will be indicated by `MS` while memory limit indicated by `MB`.

If they are not specificed ( also for a language ), it will be set as default.
## judge
	{
		cmd: "judge",
		ansId: Number,
		type: "default", // also "float", "spj" (temporarily not supported)
		args: String,
		spjId: String // not used 
		stdOutputFile: String, 
		// also: [ String ]
	}

`ansId` indicates which target will be judged. (Numbered from 0)

Judge allows comparing user output and standard output.

Each judge action will generate a float between 0 and 1.

It is strictly required that the input file of a `judge` action judges the result of the last `exec` action.

If the last `exec` action fails, the result of `judge` will automatically be `0`.

`judge` actions will be numbered from `0` to `n` in convenience of `score` action.
## score
	{
		cmd: "score",
		logic: {
			fullScore: Number,
			func: String,
			// one of and, or, sum
			compoments: Array
		}]
	}

Generally, there is only one `score` in the end. It depends on results of `judge` actions. Judge results are uniquely numbered from 0.

It returns the score of this judge request. 

