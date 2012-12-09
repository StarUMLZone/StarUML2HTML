/*
 * jQuery Imageryfier plugin 0.1
 *
 * http://jquery-imageryfier.googlecode.com
 *
 * Copyright (c) 2007 Paulo Fagiani
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Note: This plugin depends on the (YET HACKED) jQuery SuperFlyDOM plugin
 *
 */
 
/**
 * 
 * This plugin for JQuery provides features like zoom, panning with
 * coordinates and thumbnail navigation in a unobtrusive way that
 * JQuery proposes. 
 *
 * @version		0.1
 * @author		Paulo Fagiani
 * @copyright 	(c) 2007. All rights reserved.
 * @license		http://www.opensource.org/licenses/mit-license.php
 * @license		http://www.opensource.org/licenses/gpl-license.php
 * @package		jQuery Plugins
 * @subpackage	Imageryfier
 * 
 *
 */

(function($)
{
	jQuery.fn.imagerify = function(settings)
	{
		// Setting defaults as no parameter is required at all
		settings = $.extend(
		{
			debug:				false,
			width:				50,
			height:				50,
			showNavigator:		true,
			navigatorSize: 		"25%",
			showZoom:			true,
			initialZoomFactor:	0.5,
			zoomFactorInterval:	2,
			minZoomFactor:		1,
			maxZoomFactor:		32,
			showCoordinates:	false,
			coordinatesXName:	"X",
			coordinatesYName:	"Y",
			enableSelection:	false
		}, settings);
		return this.each(function()
		{
			var debug;
			var image					= $(this);
			var initialWidth			= this.width;
			var initialHeight			= this.height;
			var imageId					= this.id;
			var container 				= "Container";
			var imageryfierContainerId 	= imageId + "Imageryfier" + container;
			var imageContainerId 		= imageId + "Image" + container;
			var clicked = false;
			var navigatorAreaId;
			var navigatorSizeRatio 		= 0;
			var currentZoomFactor 		= settings.initialZoomFactor;
			var dragged					= false;
            // If debug mode is enabled, let's create a div on the page to show stuff
			if(settings.debug)
			{
				//Maybe later use Firebug plugin or some other fancy way to debug...
				debug = $("body").createAppend("div", { id: "debug" });
			}

			$(this).createWrap(
				"div",
					{
						id: 		imageryfierContainerId,
						className:	"imageryfierContainer"
					}, 	["div",	
							{
								id:			imageContainerId,
								className:	"imageContainer",
								style: 		"overflow:" + "hidden;" +
											"width:"    + settings.width  + "px;" +
											"height:"   + settings.height + "px;"
							}
						]);
			// ERI
			/*
				$(this).createWrap(
				"div",
					{
						id: 		imageryfierContainerId + "StatusBar",
						className:	"test"
					}, 	["div",	
							{
								id:			imageContainerId + "StatusBar",
								className:	"test",
								style: 		"background-color:#336699;" +
											"width:"    + settings.width  + "px;" +
											"height:"   + settings.height + "px;"
							}
						]);
*/
			// END ERI
         	$(this).draggable(
         		{
         			cursor:		"move",
         			drag:		dragHandler
         	 	}).css(
         	 			{
         	 				position: 	"absolute",
         	 				width:		parseInt(initialWidth  * settings.initialZoomFactor),
         	 				height:		parseInt(initialHeight * settings.initialZoomFactor)
         	 			});
         	 
         	 if( settings.showNavigator )
         	 {
         	    var navigator 				= imageId + "Navigator";
         	    var navigatorContainerId 	= navigator + container;
         	    var navigatorThumbnailId	= navigator + "Thumbnail";
         	    navigatorAreaId 			= navigator + "Area";
         	    navigatorSizeRatio 			= parseInt(settings.navigatorSize) / 100;
				
         	    //var width  					= parseInt(initialWidth  * navigatorSizeRatio);
         	    //var height 					= parseInt(initialHeight * navigatorSizeRatio);
				// Navigator size is now in pixel and fixed
				var width  					= parseInt(settings.navigatorWidth);
				var height 					= parseInt(settings.navigatorHeight);
        	 	$("#" + imageryfierContainerId).createAppend(
        	 		"div",
        	 			{
							id: 		navigatorContainerId,
							className:	"navigatorContainer",
							style:		"height:" + height + "px;" +
										"width:"  + width  + "px;"
						}, 	[ "img",
								{
									id:		navigatorThumbnailId,
									src: 	this.src,
									style:	"height:" + height + "px;" +
											"width:"  + width  + "px;"
								},
							"div",
								{
									id:			navigatorAreaId,
									className:	"navigatorArea",
									style:		"left:"	  + "-1px;" +
												"top:"    + "-1px;" +
												"width:"  + ( settings.width  * navigatorSizeRatio / settings.initialZoomFactor) + "px;" +
												"height:" + ( settings.height * navigatorSizeRatio / settings.initialZoomFactor) + "px;"
								}
							]).draggable(
								{
									cursor:	"move",
									drag: 	function(e, ui)
										{
											var coordinates = calculateCoordinates($(this), ui);
											var reflection = ( !settings.enableSelection ? image : $("#" + imageContainerId) );
											reflection.css(
												{ 
													left: 	coordinates.left,
													top:	coordinates.top
												});
											//debug.html("left: " + ui.position.left +  " top: " + ui.position.top);
											//debug.html($("#" + imageId).css("left") + " - " + $("#" + imageId).css("top"));
											//debug.html("ui.left: " + ui.draggable.pos[0] + "<br/>ui.top: " + ui.draggable.pos[1] + "<br/>image.left: " + image.css("left") + "<br/>image.top: " + image.css("top")); 
										} 
								}).fadeTo(3000, 0.4);
         	 }
         	 if( settings.showZoom )
         	 {
         	 	var zoom 			= imageId + "Zoom";
         	 	var zoomContainerId = zoom + container;
         	 	var zoomFactorId	= zoom + "Factor";
         	 	var zoomResetId 	= zoom + "Reset";
         	 	var zoomInId		= zoom + "In";
         	 	var zoomOutId		= zoom + "Out";
         	 	$("#" + imageryfierContainerId).createPrepend(
         	 		"div",
         	 			{
							id: 		zoomContainerId,
							className:	"zoomContainer"
						}, ["div",
								{
									id:			zoomFactorId,
									className:	"zoomFactor"
								}, [ currentZoomFactor + "x"],
							"img",
								{
									id:		zoomResetId, 
									src: 	"../image/zoom.png"
								}, 
							"img",
								{
									id:		zoomInId,
									src: "../image/zoom_in.png"
								},
							"img",
								{
									id:		zoomOutId,
									src: "../image/zoom_out.png"
								} 
							]);
				$("#" + zoomResetId).click( function()
					{
						var direction = "in";
						if( currentZoomFactor > settings.initialZoomFactor)
						{
							direction = "out";
						}
						if( currentZoomFactor != settings.initialZoomFactor )
						{
							currentZoomFactor = settings.initialZoomFactor;
							rescaleImage(direction);
						}
					});
				$("#" + zoomInId).click( function()
					{
						var proposedZoomFactor = currentZoomFactor * settings.zoomFactorInterval;
						if(currentZoomFactor <= settings.maxZoomFactor && proposedZoomFactor <= settings.maxZoomFactor)
						{
							currentZoomFactor = proposedZoomFactor;
							rescaleImage("in");
						}
					});
				$("#" + zoomOutId).click( function()
					{
						var proposedZoomFactor = currentZoomFactor / settings.zoomFactorInterval;
						debug.html(	"currentZoomFactor (" + currentZoomFactor + ") > settings.minZoomFactor (" + settings.minZoomFactor + ") = " + (currentZoomFactor > settings.minZoomFactor ? "true" : "false") + "\n" +
									"proposedZoomFactor (" + proposedZoomFactor + ") > settings.minZoomFactor (" + settings.minZoomFactor + ") = " + (proposedZoomFactor > settings.minZoomFactor ? "true" : "false") + "\n" +
									"result = " + (currentZoomFactor > settings.minZoomFactor && proposedZoomFactor > settings.minZoomFactor ? "true" : "false"));
						if(currentZoomFactor >= settings.minZoomFactor && proposedZoomFactor >= settings.minZoomFactor)
						{
							currentZoomFactor = proposedZoomFactor;
							rescaleImage("out");
						}
					});
				
				//Function separated for avoiding DRY code
				function rescaleImage(direction)
				{
					var moveWidth	= parseInt( settings.width  * navigatorSizeRatio / currentZoomFactor);
					var moveHeight 	= parseInt( settings.height * navigatorSizeRatio / currentZoomFactor);
					var moveLeft	= parseInt($("#" + navigatorAreaId).css("left")) + (direction == "out" ? (-moveWidth  / 4) : moveWidth  / 2);
					var moveTop		= parseInt($("#" + navigatorAreaId).css("top"))  + (direction == "out" ? (-moveHeight / 4) : moveHeight / 2);
					var ui = 
					{ 
						"position": 
						{
							"left":		moveLeft,
							"top":		moveTop,
							"width":	moveWidth,
							"height":	moveHeight
						},
						"draggable":
						{
							"pos":
							[
								moveLeft,
								moveTop
							]
						}
					}					

					var coordinates = calculateCoordinates($("#" + navigatorAreaId), ui);
					debug.html("image.left: " + coordinates.left + "\nimage.top: " + coordinates.top);
					moveLeft = coordinates.pos[0];
					moveTop  = coordinates.pos[1];
					$("#" + navigatorAreaId).animate(
						{
							left:	moveLeft,
							top:	moveTop,
							width: 	moveWidth,
							height:	moveHeight
						}, 1000);
					var reflection = ( !settings.enableSelection ? image : $("#" + imageContainerId) );
					var acoordinates =
						{
							width:		parseInt(initialWidth  * currentZoomFactor),
         	 				height:		parseInt(initialHeight * currentZoomFactor),
         	 				left:		coordinates.left,
         	 				top:		coordinates.top
						};
					reflection.animate( acoordinates, 
						{
							duration: 1000,
							queue: false
						});
					if( reflection != image )
					{
						image.animate(
							{
								width:		acoordinates.width,
	         	 				height:		acoordinates.height
							}, 	{
									duration: 1000,
									queue: false
								});
					}
					$("#" + zoomFactorId).html(currentZoomFactor + "x");
					if( settings.enableSelection && $("#" + selectionBoxId).css("display") != "none" )
					{
						var left = parseInt($("#" + selectionBoxId).css("left"));
						var top  = parseInt($("#" + selectionBoxId).css("top"));
						$("#" + selectionBoxId).animate(
							{
								left:	parseInt( direction == "out" ? left / settings.zoomFactorInterval : left * settings.zoomFactorInterval ),
								top:	parseInt( direction == "out" ? top  / settings.zoomFactorInterval : top  * settings.zoomFactorInterval ),
								width:	currentZoomFactor,
								height:	currentZoomFactor
							}, {
									duration: 1000,
									queue: false 
								});
					}
				}
         	 }
			if( settings.showCoordinates )
			{
				var coordinates 			= imageId + "Coordinates";
				var coordinatesContainerId 	= coordinates + container;
				var coordinatesXNameId 		= coordinates + "XName";
				var coordinatesYNameId 		= coordinates + "YName";
				var coordinatesXValueId		= coordinates + "XValue";
				var coordinatesYValueId		= coordinates + "YValue";
				$("#" + imageryfierContainerId).createAppend(
					"div",
						{
							id:			coordinatesContainerId,
							className:	"coordinatesContainer"
						}, 	[ 
							"span",
								{
									id:			coordinatesXNameId,
									className:	"coordinatesName"
								}, [ settings.coordinatesXName + ":" ],
							"span",
								{
									id:			coordinatesXValueId,
									className:	"coordinatesValue"
								}, [ "" ],
							"span",
								{
									id:			coordinatesYNameId,
									className:	"coordinatesName"
								}, [ settings.coordinatesYName + ":" ],
							"span",
								{
									id:			coordinatesYValueId,
									className:	"coordinatesValue"
								}, [ "" ]
						   	]);
				var coordsContainer = $("#" + coordinatesContainerId);
				if( coordsContainer.css("position") == "absolute" )
				{
					coordsContainer.hide();//.fadeTo(1, 0.5);
					image.hover(function(event)
						{
							//TODO find a way to detect if the mouse starts over the image and not show the div initially
							//image.mousemove(event);
							coordsContainer.show();
						}, function()
						{
							coordsContainer.hide();
						});
				}
				else
				{
					image.mouseout(function()
						{
							$(".coordinatesValue").empty();
						});
				}
				image.mousemove(function(event)
					{
						var coordsContainer = $("#" + coordinatesContainerId);
						if( coordsContainer.css("position") == "absolute" )
						{
							coordsContainer.css(
								{
									left: 	event.pageX,
									top:	event.pageY
								});
						}
						var offset = $(this).offset();
						//IE when using strict CSS mode starts offset by (2,2). This is stored on documentElement client property
						// TODO: look why Safari ends up with a (4,9) offset difference, maybe another property defines this?
						var xValue = parseInt((event.pageX - offset.left - ( document.documentElement.clientLeft || 0 )) / currentZoomFactor);
						var yValue = parseInt((event.pageY - offset.top  - ( document.documentElement.clientTop  || 0 )) / currentZoomFactor);
						$("#" + coordinatesXValueId).html("" + xValue );
						$("#" + coordinatesYValueId).html("" + yValue );
						//debug.html("event.pageX: " + event.pageX + "<br/>event.pageY: " + event.pageY + "<br/>left: " + left + "<br/>top: " + top + "<br/>this.offsetLeft: " + $(this).offset().left + "<br/>this.offsetTop: " + $(this).offset().top + "<br/>parseInt((event.pageX [" + event.pageX + "] - $(this).offset().left) [" + $(this).offset().left + "] / currentZoomFactor [" + currentZoomFactor + "] )");
						debug.html(	"clientLeft: " + document.documentElement.clientLeft + "<br/>" +
									"cluentTop : " + document.documentElement.clientTop  + "<br/>" +
									"this.offsetLeft: " + offset.left + "<br/>" +
									"this.offsetTop : " + offset.top  + "<br/>" +
									"clientX: " + event.clientX + "<br/>" +
									"clientY: " + event.clientY + "<br/>" +
									"layerX:  " + event.layerX  + "<br/>" +
									"layerY:  " + event.layerY  + "<br/>" +
									"offsetX: " + event.offsetX + "<br/>" +
									"offsetY: " + event.offsetY + "<br/>" +
									"pageX:   " + event.pageX   + "<br/>" +
									"pageY:   " + event.pageY   + "<br/>" +
									"screenX: " + event.screenX + "<br/>" +
									"screenY: " + event.screenY + "<br/>" +
									"X:       " + event.x       + "<br/>" +
									"Y:       " + event.y); 

					});
			}
			if( settings.enableSelection )
			{
				var selection 			= imageId + "Selection";
				var selectionContainer	= selection + container;
				var selectionBoxId		= selection + "Box";
				$("#" + imageContainerId).css(
					{
						overflow:	"visible",
						width:		initialWidth,
						height:		initialHeight
					}).draggable(
						{
					    	cursor:	"move",
					    	drag:	dragHandler,
							start:		function()
								{
									dragged=true;
								},
							stop:		function()
								{
									dragged = false;
								}
					    }).createAppend(
							"div",
								{
									id:			selectionBoxId,
									className:	"selectionBox",
									style:		"width: " + currentZoomFactor + "px;" +
												"height: "+ currentZoomFactor + "px;"
								}).hover(function(event)
									{
										$("#" + coordinatesContainerId).addClass("coordinatesContainerSelection").show();
									},function()
									{
										$("#" + coordinatesContainerId).removeClass("coordinatesContainerSelection").show();
									}).mousemove(function(event)
										{
											image.trigger("mousemove", [event]);
										}).hide().parent().createWrap(
											"div",
												{
													id:			selectionContainer,
													className:	"selectionContainer",
													style:		"overflow:" + "hidden;" +
																"width: "   + settings.width + "px;" +
																"height: "  + settings.height + "px;"
												});
				image.draggableDestroy().mouseup(function(event)
						{
							if(!dragged)
							{
								//TODO: refactor this DRY code
								var offset = $(this).offset();
								var xValue = parseInt((event.pageX - offset.left - ( document.documentElement.clientLeft || 0 )) / currentZoomFactor);
								var yValue = parseInt((event.pageY - offset.top  - ( document.documentElement.clientTop  || 0 )) / currentZoomFactor);
								$("#" + selectionBoxId).css(
									{
										left:	xValue * currentZoomFactor,
										top:	yValue * currentZoomFactor
									}).show();
							}
						});
			}

			//This function was separated because it can be used both by the image dragger or the selection one
			function dragHandler(e, ui) 
   			{
   				//debug.html("left: " + $(this).css("left") + " top: " + $(this).css("top"));
   				var leftMax = this.width - settings.width;
   				var topMax  = this.height - settings.height;
   				// Make sure we don't drag beyond image limits
   				if( ui.position.left > 0 )				ui.draggable.pos[0] = 0;
   				if( ui.position.top  > 0 ) 				ui.draggable.pos[1] = 0;
   				if( ui.position.left + leftMax < 0 )	ui.draggable.pos[0] = 0 - leftMax;
   				if( ui.position.top  + topMax  < 0 )	ui.draggable.pos[1] = 0 - topMax;
   				//debug.html($("#" + navigatorAreaId).attr("class") + " - ui.position.left: " + ui.position.left + " ui.position.top: " + ui.position.top + " ui.draggable.pos[0]: " + ui.draggable.pos[0] + " ui.draggable.pos[1]: " + ui.draggable.pos[1]);
   				$("#" + navigatorAreaId).css(
   					{
   						left:	parseInt( -ui.draggable.pos[0] * navigatorSizeRatio / currentZoomFactor ) - 1,
   						top:	parseInt( -ui.draggable.pos[1] * navigatorSizeRatio / currentZoomFactor ) - 1 
   					});
   	 		}

			//This function was separated because it's called from two places
         	function calculateCoordinates(object, ui)
			{
				var maxWidth  = parseInt(object.parent().css("width"))  - ( ui.position.width  || parseInt(object.css("width")));
				var maxHeight = parseInt(object.parent().css("height")) - ( ui.position.height || parseInt(object.css("height")));
				var left = parseInt( -ui.draggable.pos[0] / navigatorSizeRatio * currentZoomFactor );
				var top  = parseInt( -ui.draggable.pos[1] / navigatorSizeRatio * currentZoomFactor );
				if( ui.position.left < 0 )
				{
					ui.draggable.pos[0] = -1;
					left = 0;
				}
  				if( ui.position.top  < 0 )
   				{
   					ui.draggable.pos[1] = -1;
   					top = 0;
   				}
				if( ui.position.left > maxWidth  )
				{
				 	ui.draggable.pos[0] = maxWidth - 1;
				 	left = -(image[0].width - settings.width);
				 	if( ui.position.width )
				 		left = -(image[0].width / 2 - settings.width);
				}
				if( ui.position.top  > maxHeight )
				{
					ui.draggable.pos[1] = maxHeight -1;
					top = -(image[0].height - settings.height);
					if( ui.position.height )
						top = -(image[0].height / 2 - settings.height);
				}
				return {left: left, top: top, pos: ui.draggable.pos};
			}	 
		});
	};
})(jQuery);