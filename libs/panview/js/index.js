$(initialize);

function initialize()
{
	$("#umlDiagramImage").imagerify(
							{
								height: 			300,
								width: 				400,
								navigatorSize: 		"12%",
								initialZoomFactor:	1,
								minZoomFactor:		0.5,
								navigatorHeight:	50,
								navigatorWidth:		70,
								debug: 				false
							});
}
