/*
 *  harvestr
 *  ========
 * 	Scrape the web with a JSON object.
 * 	
 * 	Wes Johnson				@SterlingWes
 *  wesquire.ca/harvestr	github.com/sterlingwes/harvestr
 * 
 *	(The MIT License)
 *
 *	Copyright (c) 2012 Wes Johnson
 *
 *	Permission is hereby granted, free of charge, to any person obtaining
 *  a copy of this software and associated documentation files (the
 *  "Software"), to deal in the Software without restriction, including
 *  without limitation the rights to use, copy, modify, merge, publish,
 *  distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to
 *  the following conditions:
 * 
 * 	The above copyright notice and this permission notice shall be
 *  included in all copies or substantial portions of the Software.
 * 
 * 	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * 	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 *  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 *  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 *  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
*/

var Harvestr = (function() {

	var cheerio = require('cheerio'),
		async	= require('async'),
		request = require('request'),
		fs		= require('fs'),
		config	= {
			request: {
				method: 'GET'
			},
			debug: 5,
			encoding: 'ascii',
			logTheme: {
				enabled: 	true,
				bg:			'black',
				0:		{
					color:	'magenta',
					style:	'1',
					tag:	''
				},
				1:		{
					color:	'red',
					style:	'1',
					tag:	'Error'
				},
				2:		{
					color:	'yellow',
					style:	'1',
					tag:	'Warn'
				},
				3:		{
					color:	'green',
					style:	'1',
					tag:	'Info'
				},
				4:		{
					color:	'cyan',
					style:	'0',
					tag:	'Debug'
				},
				5:		{
					color:	'white',
					style:	'0',
					tag:	''
				}
			},
			commands: [
				'each',
				'once',
				'exec'
			],
			ansi: {
				white:	'37',
				cyan:	'36',
				magenta:'35',
				blue:	'34',
				yellow:	'33',
				green:	'32',
				red:	'31',
				black:	'30',
				reset:	'\033[0m',
				escape:	'\033[%CODE%m'
			},
		},
		rxFunc		= /(\(.*?\);?)/gi,		// used to determine whether string represents a function/method call
		rxArgClean	= /(?:\(|\)|;)/gi,		// used to clean args of brackets or semi colons
		rxArgClean2	= /(?:'|")/gi;			// used to clean args of quotes

	this.utils = {
		getArgs:	function(params) {
			var args = params.replace(rxArgClean,'').split(',');
			var newArgs = [];
			args.forEach(function(arg) {
				if("string" === typeof arg && arg.trim().length>0) {
					newArgs.push(arg.trim().replace(rxArgClean2,''));
				}
			});
			if(newArgs.length>0)	return newArgs;
			else					return null;
		},
		getFunky:	function(that,op) {
			if("string" === typeof op) {
				var rx = op.match(rxFunc);
				if(rx) {
					var method 	= op.replace(rxFunc,''),
						args	= utils.getArgs(rx[0]);
					return that[method].apply(that, args);
				} else
					return false;
			} else
				return false;
		},
		color:		function(lvl) {
			if(config.logTheme && config.logTheme.enabled) {
				var color = config.logTheme[lvl].color;
				return config.ansi.escape.replace(/%CODE%/,config.logTheme[lvl].style+';'+config.ansi[color]+';'+(config.ansi[config.logTheme.bg]+10));
			}
			else
				return config.ansi.reset;
		},
		log:		function(lvl,msg) {
			if(typeof lvl === 'undefined')	console.log(' ');
			else if(lvl<=config.debug) {
				console.log(utils.color(lvl) + config.logTheme[lvl].tag + '\t' + msg + config.ansi.reset);
			}
		},
		unique:	[
			/^#[^\s]+$/, /:first/, /:last/, /:eq/
		],
		isUnique: function(selector) {
			utils.unique.forEach(function(regex) {
				if(selector.match(regex))	return true;
			});
			return false;
		},
		exists: 	function(obj, prop) {
			var parts = prop.split('.');
			for(var i = 0, l = parts.length; i < l; i++) {
				var part = parts[i];
				if(obj !== null && typeof obj === "object" && part in obj)
					obj = obj[part];
				else
					return false;
			}
			return true;
		}
	};

	this.applyConfig = function(opts) {
		if("object" === typeof opts)
			for(o in opts) {
				switch(o) {
					case 'request':
						for(i in opts.request)
							config.request[i] = opts.request[i];
						break;
						
					default:	config[o] = opts[o];	break;
				}
			}
	};

	this.fetch = function(url,callback) {
		if(config.debug) utils.log(3,'Making request to '+url);
		request({url:url,method:config.request.method}, function(err,response,body) {
			if(err)	return utils.log(1,JSON.stringify(err));
			else 	callback(cheerio.load(body));
		});
	};

	this.getBatch = function(urls,schema,callback,timeout) {
		var dis 	= this,
			result	= {};
		
		if(Array.isArray(urls)) {
			next(0);
		}
		
		function next(index) {
			dis.get(urls[index],schema,function(res) {
				index++;
				result[urls[index]] = res;
				if(index==urls.length) {
					if(typeof callback === 'function')
						callback(result);
					else if(typeof callback === 'object') {
						var getOpts = callback;
						if(getOpts.path) {
							var file = fs.createWriteStream(getOpts.path,getOpts.options);
							if(file.writable)
								file.once('open', function(fd) {
									utils.log(3,'Wrote result to file: '+getOpts.path);
									utils.log();
									file.write(JSON.stringify(result,null,'\t'));
								});
							else
								utils.log(1,'Unable to write to file '+getOpts.path);
						} else
							utils.log(1,'Unable to write to file '+getOpts.path);
					}
				}
				else
					if("number" === typeof timeout)
						setTimeout(function() {
							next(index);
						}, timeout);
					else
						next(index);
			});
		}
	};

	this.get = function(url,schema,done) {
		utils.log();
		
		// check if we need to write the response to a file
		if(typeof done == 'object') {
			var getOpts = done;
			if(done.path) {
				done = function(result) {
					var file = fs.createWriteStream(getOpts.path,getOpts.options);
					if(file.writable)
						file.once('open', function(fd) {
							utils.log(3,'Wrote result to file: '+getOpts.path);
							utils.log();
							file.write(JSON.stringify(result,null,'\t'));
						});
					else
						utils.log(1,'Unable to write to file '+getOpts.path);
				};
			} else
				return utils.log(1,'Invalid GET request finish parameter. Object must have path attribute.');
		}
		
		fetch(url,function($) {
			
			var response = {};
			
			async.forEach(Object.keys(schema), function(s,cb) {
				// process each top level selector
				process(s,{},schema,function(err,topResult) {
					if(err) cb(err);
					else {
						response = topResult;
						cb();
					}
				});
			}, function(err) {
				// done with top level selectors
				if(!err)	utils.log(3,'DONE');
				else	utils.log(2,'DONE with error');
				utils.log();
				if("function" === typeof done)	done(response);
				else							return response;
			});
			
			function process(s,obj,model,processed,parent,parentIndex,parentSize) {

				var target, parentSize = parentSize?parentSize:1;
				
				if(parent)	{
					utils.log(4,'Processing '+s+(parentIndex?' '+parentIndex+'/'+parentSize:'')+' as child of '+(typeof parent == 'object' ? parent.name : parent));
					target = $(parent).find(s);
				}
				else {
					utils.log(4,'Processing '+s+'...');
					try {
						target = $(s);
					} catch(e) {
						utils.log(1, 'Problem selector: '+s);
						return processed(e);
					}
				}
				
				// format the result chain appropriately whether multiple values or a single value
				//
				function addResult(cmd,val,multi) {
					if(!obj)	obj 	= {};
					if(!obj[s])	obj[s] 	= {};
					if((cmd=='each' || multi || parentSize>1) && !obj[s][cmd]) obj[s][cmd] = [];
					if(cmd=='each' || multi || parentSize>1)	obj[s][cmd].push(val);
					else			obj[s][cmd] = val;
				}
				
				// do we have nested operations or does it end here?
				// we may need to loop from here
				//
				if("object" === typeof model[s]) {
				
					// exec allows us to operate on the result of a function applied to our selector
					// if no exec operation, operate on our selector
					//
					if(model[s].exec) {
						utils.log(4,'EXEC-> '+model[s].exec);
						// update our target node(s) upon application of exec
						if(typeof model[s].exec === 'string')
							target = utils.getFunky($(s),model[s].exec);
						else if(typeof model[s].exec === 'function')
							target = model[s].exec($,0,$(s));
						runOps();
					} else {
						// find out if there's any selectors in this object
						//
						var select = Object.keys(model[s]).filter(function(sel) {
							return (config.commands.indexOf(sel)==-1);
						});
						
						// try to iterate
						//
						if(!obj[s]) obj[s] = {};
						async.forEach(select, function(subkey,subcb) {
							process(subkey,obj[s],model[s],function(err,subresult) {
								// augment our response data
								obj[s] = subresult;
								subcb();
							},s);
						}, function(err) {
							// continue on finish
							runOps();
						});
					}
					
					function runOps() {
					
						// run a command on the node
						async.forEach(config.commands,	function(cmd,cmdcb) {
							if(cmd!='exec' && model[s][cmd]) {
								switch(typeof model[s][cmd]) {
									case "string":
										utils.log((target.size()>0)?4:2,cmd.toUpperCase()+'-> size '+target.size()+((target.size()>0)?', apply '+model[s][cmd]:', no matching nodes to operate on'));
										var agg = [];
										function performCmd(i,item) {
											// try applying the property as a function, otherwise assume it's a property
											var result = utils.getFunky($(item),model[s][cmd]);
											if(cmd!='each') {
												if(result) 	addResult(cmd,result);
												else		addResult(cmd,$(item)[model[s]]);
											} else
												agg.push((result?result:$(item)[model[s]]));
										}
										if(cmd=='each')	{
											target.each(performCmd);
											addResult(cmd,agg);
										}
										else if(cmd=='once' && target.size()>0)	performCmd(0,target.get(0));
										cmdcb();
										break;
										
									case "function":
										// apply custom user function to selector
										//
										utils.log((target.size()>0)?4:2,cmd.toUpperCase()+'-> size '+target.size()+((target.size()>0)?', apply custom function':', no matching nodes to operate on'));
										var aggF = [];
										function performFunc(i,item) {
											var result = model[s][cmd]($,i,item);
											if(result && cmd!='each')	addResult(cmd,result);
											else if(result)	aggF.push(result);
										}
										if(cmd=='each') {
											target.each(performFunc);
											addResult(cmd,aggF);
										}
										else if(cmd=='once' && target.size()>0) performFunc(0,target.get(0));
										cmdcb();
										break;
										
									case "object":
										// iterate over nested selectors as we have here
										//
										utils.log((target.size()>0)?4:2,cmd.toUpperCase()+'-> size '+target.size()+((target.size()>0)?', traversing to next level down':', no matching nodes to operate on'));
										
										// find out if there's any selectors in this object
										//
										var select = Object.keys(model[s][cmd]).filter(function(sel) {
											return (config.commands.indexOf(sel)==-1);
										});
										
										function performOp(ind,t) {
											if(!obj[s]) obj[s] = {};
											async.forEach(select, function(subkey,subcb) {
												process(subkey,obj[s][cmd],model[s][cmd],function(err,subresult) {
													// augment our response data
													obj[s][cmd] = subresult;
													subcb();
												},t,ind+1,(cmd=='each'?target.size():1));
											}, function(err) {
												// continue .each, below, on finish until done
											});
										}
										
										if(cmd=='each') {
											target.each(performOp);
											cmdcb();
										}
										else if(cmd=='once' && target.size()>0)
											performOp(0,target.get(0));
										else
											cmdcb();
										break;
										
									default:
										utils.log(1,'Unrecognized '+(typeof cmd)+' command '+(cmd? JSON.stringify(cmd) : ''));
										break;
								}
							} else {
								cmdcb();
							}
						}, function(err) {
							// end process()
							processed(null,obj);
						});
					}
				}
				// it's a direct operation on the selector
				else if("string" === typeof model[s]) {
					utils.log((target.size()>0)?4:2,'NODE-> size '+target.size()+((target.size()>0)?', apply '+model[s]:', no matching node to operate on'));
					var agg = [];
					function applyOp(i,item) {
						var result = utils.getFunky($(item),model[s]);
						if(result && target.size()<=1) addResult(model[s],result);
						else if(result) 			agg.push(result);
						else if(target.size()<=1)	addResult(model[s],target.text());
						else						agg.push(target.text());
					}
					if(target.size()>1) {
						target.each(applyOp);
						addResult(model[s],agg);
					} else if(target.size()==1) {
						applyOp(0,target.get(0));
					}
					processed(null,obj);
				}
				// direct callback on selector
				else if("function" === typeof model[s]) {
					utils.log((target.size()>0)?4:2,'NODE-> size '+target.size()+((target.size()>0)?', apply custom function':', no matching node to operate on'));
					var aggF = [];
					function applyFunc(i,item) {
						var result = model[s]($,i,item);
						if(result && target.size()<=1) addResult('function',result);
						else if(result)	aggF.push(result);
					}
					if(target.size()>1) {
						target.each(applyFunc);
						addResult('function',aggF);
					} else if (target.size()==1)
						applyFunc(0,target.get(0));
					processed(null,obj);
				}
				// fail
				else
					utils.log(1,'Unrecognized '+(typeof model[s])+' command '+(model[s]? JSON.stringify(model[s]) : ''));
			}
		});
	};
	
	// check if we were run from the command line
	var	pargE		= process.argv.indexOf('-e'),
		pargI		= process.argv.indexOf('-i'),
		pargO		= process.argv.indexOf('-o');
		
		utils.log();
		utils.log(5,'harvestr :)\twesquire.ca/harvestr');
		
	if(pargI>-1 && process.argv[pargI+1]) {
	
		if(pargE!=-1 && process.argv[pargE+1])
			config.encoding = process.argv[pargE+1];
			
		// read input file
		var fn 		= process.argv[pargI+1],
			file	= fs.createReadStream(fn, {
				flags: 		'r',
				encoding:	config.encoding
			});
		if(file.readable)
			file.once('open', function(fd) {
				utils.log(4,'Reading '+fn);
				var raw = '';
				file.on('data', function(data) {
					raw += data;
				});
				file.on('end', function() {
					var json;
					try{
						json = JSON.parse(raw);
						
						// run our query and pass through the output info
						if(json['harvestr:meta'] && json['harvestr:schema']) {
							var finished = {};
							if(pargO>-1)
								finished.path = process.argv[pargO+1];
							else if(utils.exists(json,'harvestr:meta.output.filename'))
								finished.path = json['harvestr:meta'].output.filename;
							else
								finished = function(result) {
									console.log(result);
								};
							var ofn		= process.argv[pargO+1];
							if(utils.exists(json,'harvestr:meta.target') && typeof json['harvestr:meta'].target === 'string') {
									Harvestr.get(json['harvestr:meta'].target,json['harvestr:schema'],finished);
							} else if(utils.exists(json,'harvestr:meta.target') && Array.isArray(json['harvestr:meta'].target)) {
									Harvestr.getBatch(json['harvestr:meta'].target,json['harvestr:schema'],finished);
							} else
								utils.log(1,'Invalid input file. No target URL found.');
						} else
							utils.log(1,'Invalid schema file. No harvestr:meta or harvestr:schema keys found.');
						
					} catch(e) {
						// likely a syntax error
						utils.log(1,'Invalid syntax in input file. Expected valid JSON');
					}
				});
				file.on('error', function(e) {
					utils.log(1,'An error occurred while reading stream for file '+fn);
					throw e;
				});
			});
		else
			utils.log(1,'Unable to open '+fn);
	} else {
		utils.log();
		utils.log(0,'harvestr command line options:');
		utils.log(0,'-i myinputfile.json (required)');
		utils.log(0,'-o myoutputfile.txt');
	}
	
	return {
		get:		get,
		getBatch:	getBatch,
		config:		config,
		log:		utils.log
	};

})();

exports.start = Harvestr;