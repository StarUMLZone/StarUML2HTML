function isSelect(diagramId,elementId){
	extAreaOver(diagramId, elementId);
}

function deSelect(diagramId,element){
	extAreaOut(diagramId, element.id);
}

function select(id){
	self.parent.select(document.getElementById(id));
}

function setCurrentDiagram(id){
	self.parent.setCurrentDiagram(id);
}