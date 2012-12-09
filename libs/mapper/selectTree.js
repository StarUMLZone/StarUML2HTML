function select(id){
	self.parent.select(document.getElementById(id));
}

function deSelect(diagramId,element){
	document.getElementById(element.id).style.fontWeight = "normal";
}
			
function isSelect(currentDiagramId,elementId){
	document.getElementById(elementId).style.fontWeight = "bold";
}