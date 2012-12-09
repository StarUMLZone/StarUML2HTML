$(initialize);

function initialize()
{
	$("#myImage").imagerify(
							{
								height: 			300,
								width: 				400,
								navigatorSize: 		"12%",
								initialZoomFactor:	1,
								minZoomFactor:		0.5,
								debug: 				true
							});
}
