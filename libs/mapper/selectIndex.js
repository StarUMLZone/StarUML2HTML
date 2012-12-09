	var selectedElement;
	var currentDiagramId ;
	var registeredComponent = new Array(); ;
		
	function setCurrentDiagram(id){
		currentDiagramId = id;	
	}
		
	function addSelectionListener(frameId){
		
		for(i=0 ; i<self.frames.length ; i++){
			if(self.frames[i].name == frameId)
				registeredComponent.push(self.frames[i]);
		}
	
	}
		
	function select(element){

		if(selectedElement != element){
				
			if(selectedElement != null){
			
				for (i =0 ; i< registeredComponent.length;i++){
					registeredComponent[i].deSelect(currentDiagramId,selectedElement);
				}
				selectedElement = null;
			}
			
			selectedElement = element;

			for (j =0 ; j < registeredComponent.length;j++){
				registeredComponent[j].isSelect(currentDiagramId,element.id);	
			}			
				
		}
		
		return false;
	}