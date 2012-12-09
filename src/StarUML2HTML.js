/********************************************************************************
*                           StarDoc (version 2.1)                               *
*            This StarUML javascript add-in integrates the sub-tasks            *
*            "modelExplorer", "HtmlTree" and "mappedImages"                     *
*                                                                               *
*   Authors                                                                     *
* Fixes/Cleaning : Jean-Marie Favre
* Integration : Gregory GOUBET                                                  *
* CreateFrame : Gregory GOUBET                                                  *
* ModelExplorer : Paul DUSSERRE (and Gregory GOUBET)                            *
* GenerateHtmlTree : Romain ROLLAND                                             *
* MappedImages : Romain BIOTEAU & Gregory GOUBET                                *
* Properties : Romain ROLLAND                                                   *
* Cleaning/refactoring: 09/12/12 Jean-Marie FAVRE
*                                                                               *
* Modification : ??/03/09   Paul DUSSERRE & Gregory GOUBET                      *
*       - modelExplorer                                                         *
* Modification : ??/03/09   Romain BIOTEAU & Gregory GOUBET                     *
*       - mappedImages                                                          *
* Modification : 16/03/09   Romain ROLLAND                                      *
*       - HtmlTree plugin intégration, mise en forme du fichier                 *
* Modification : 17/03/09   Gregory GOUBET                                      *
*       - mise en page des headers des add-ins integres                         *
*       - (re)factoring fonction getHtmlElemName                                *
*       - add area property "onclick"                                           *
*                           Romain BIOTEAU                                      *
*       - ajout de la fonctionalite "onclick" pour surligner dans la            *
* vue diagram les elements selectionnes dans le tree                            *
*                           Romain ROLLAND                                      *
*       - HtmlTree plugin modif pour gestion des frame                          *
* Modification : 20/03/09   Gregory GOUBET                                      *
*       - modif htmlTreeGetId fonction de HtmlTree plugin pour avoir des id     *
* identique entre tree et diagrams;                                             *
*       - modif getElemName fonction pour avoir des id uniques meme si les      *
* elements n'ont pas de nom (comme les associations et les stimuli);            *
*       - modif MappedImages pour prendre en compte les diagrammes de sequence  *
* Modification : 22/03/09   Gregory GOUBET                                      *
*       - integration de la version v4 du ModelExplorer;                        *
*       - modification du parcours de ModelExplorer (pour prendre en compte     *
* les diagrammes)                                                               *
* Modification : 24/03/09   Gregory GOUBET                                      *
*       - gestion de la page de properties pour le project                      *
*       - ajout de la frame "Display" (pour l'instant non utilisee)             *
*       - copie des lib dir depuis leur nouvel emplacement                      *
*                                                                               *
*       - ajout d'un parcours des vues avant construction pour calculer les     *
* bonnes coordonnees                                                            *
*       - integration des modifs de Romain BIOTEAU pour rendre ce script plus   *
* modulaire (externalisation des scripts inclus dans les fichiers html)         *
*       - integration de la version 4.1 de HtmlTree                             *
*       - integration de la version 3.1 de HtmlProperties                       *
*       - ajout de la creation des Properties du project                        *
*                                                                               *
* Date de création: 02/03/09                                                    *
* Dernière modification: 24/03/09                                               *
*                                                                               *
*********************************************************************************/

/**
 * Pour l'intégration les modifs apportées sur un plugin sont entre les commentaires suivants:
 * // [[[[  Debut Modif pour l'intégration  ]]]]
 * // [[[[  Fin Modif pour l'intégration  ]]]]
 *
 */





/********************************************************************************
* VARIABLES & RESOURCES declaration                                             *
*********************************************************************************/
var app;
var meta; // projet metaModel
var prj; // <Model ?> projet model
var prjPathName; // <String> projet path
var prjName; // <String> project name (title), used for file names
var filesystem; // file manager
var StarUML2HTMLSchemaID = "StarUML2HTML"; //SchemaID to get user options

var htmlTitle = "Auto-Generated with StarUML2HTML AddiN"; // <String> html page title
var basePath; // <String> files path (default prjPathName)
var folderName; // <String> generated folder name
var folder = null; // folder (object)
var libCommonFolder = "libs";
var mapperLibFolderName = "mapper";
var ttLibFolderName = "dw_tooltips";
var treetoolsFolderName = "treetools";
var jqueryFolderName = "panview";
var cssFolderName = "css";
var logoFolderName = "StarUML2HTML_logo";

var roots; // the array containing StarUML model elements
var prjNode; // the node containing the StarUML project element
var theGlobalNonIdentifierNameList = new Array();
var launchBrowserAutomatically; // user option to launch browser at the end of the html doc generation
var indentCode; // user option to set indentation in generated html files


// modelExplorer
//var starUmlObjects; // <Array of Node> contient tous les objets du ModelExplorer
var diagramList; // <Array of Diagram> contient tous les diagrammes du ModelExplorer

// global html index (frame)
var htmlIndexFileName = "index.html";
var htmlIndexFile;
var treeTargetName = "treeFrame";
var diagramTargetName = "diagramFrame";
var propertiesTargetName = "propertiesFrame";

var logoFileName = "StarUML2HTML_Logo.html";

// htmlTree
var htmlTreeFileName = "model_tree.html"; // <String> file name for the html Tree
var htmlTreeFile; // file (object) for the html Tree

// htmlProperties
var propPathToHtmlFiles;
var propPathToHtmlFilesName = "elementProperties";
var propCssFile = "propertySheet.css";
var propTdValueWidth = "160px";
var propTdNameWidth = "110px";

// mappedImages
var img_htmlHeader = "<HTML>\n"+
					"<HEAD>\n"+
					"<TITLE>{html_title}</TITLE>\n"+
					//"<link rel=\"stylesheet\" href=\""+ttLibFolderName+"/css/ex.css\" type=\"text/css\">\n"+
					"<link type=\"text/css\" rel=\"stylesheet\" href=\""+jqueryFolderName+"/css/index.css\"/>"+
					"<style type=\"text/css\">\n"+
					"div#tipDiv {\n"+
					"padding:4px;\n"+
					"color:#000; font-size:11px; line-height:1.2;\n"+
					"background-color:#E1E5F1; border:1px solid #667295;\n"+
					"width:210px;\n"+
					"}\n\n"+
					"div#tipDiv ul.tipContentList {\n"+
					"margin:0; padding:0; list-style:none;\n"+
					"}\n"+
					"</style>\n"+
/*					"<script type=\"text/javascript\" src=\""+jqueryFolderName+"/js/jquery-1.2.1.js\"></script>\n"+
					"<script type=\"text/javascript\" src=\""+jqueryFolderName+"/js/jquery.superflydom-0.9g.js\"></script>\n"+
					"<script type=\"text/javascript\" src=\""+jqueryFolderName+"/js/jquery.ui.mouse.js\"></script>\n"+
					"<script type=\"text/javascript\" src=\""+jqueryFolderName+"/js/jquery.ui.draggable.js\"></script>\n"+
					"<script type=\"text/javascript\" src=\""+jqueryFolderName+"/js/jquery.ui.draggable.ext.js\"></script>\n"+
					"<script type=\"text/javascript\" src=\""+jqueryFolderName+"/js/jquery.imageryfier-0.1.js\"></script>\n"+
					"<script type=\"text/javascript\" src=\""+jqueryFolderName+"/js/index.js\"></script>\n"+*/
					"<script src=\""+ttLibFolderName+"/js/dw_event.js\" type=\"text/javascript\"></script>\n"+
					"<script src=\""+ttLibFolderName+"/js/dw_viewport.js\" type=\"text/javascript\"></script>\n"+
					"<script src=\""+ttLibFolderName+"/js/dw_tooltip.js\" type=\"text/javascript\"></script>\n"+
					"<script src=\""+ttLibFolderName+"/js/dw_tooltip_aux.js\" type=\"text/javascript\"></script>\n"+
					"<script type=\"text/javascript\" src=\""+mapperLibFolderName+"/wz_jsgraphics.js\"></script>\n"+
					"<script type=\"text/javascript\" src=\""+mapperLibFolderName+"/cvi_map_lib.js\"></script>\n"+
					"<script type=\"text/javascript\" src=\""+mapperLibFolderName+"/selectDiagram.js\"></script>\n"+
					"<script type=\"text/javascript\">\n"+
					"dw_Tooltip.content_vars = {\n"+
						"{TipContent}\n"+
					"}\n"+
					"function highlight(diagramId,elementId){\n"+
					"extAreaOut(diagramId, elementId);\n"+
					"extAreaOver(diagramId, elementId);\n"+
					"}\n"+/*
					"function select(id){\n"+
					"self.parent.select(\"{diagName}\",document.getElementById(id));\n"+
					"}\n"+*//* --> register
					"function setCurrentDiagram(id){\n"+
					"self.parent.setCurrentDiagram(id);\n"+
					"}\n"+*/
					"window.onload = function() {\n"+
					"cvi_map.add(document.getElementById('{diagName}'),{opacity: 1, areacolor: '#000000', noborder: false});\n"+
					"}\n"+
					"</script>\n"+
					"</HEAD>\n"+
					"<BODY>\n";
var img_imageHeader="\t<IMG id=\"{id}\" onload=\"setCurrentDiagram(this.id);\" src=\"{imageName}\" type=\"image/jpg\"  usemap=\"#{mapName}\">\n"+ // class=\""+mapperLibFolderName+"\"
					"\t</IMG>\n"+
					"\t<MAP name=\"{mapName}\">\n";
var img_mapItem    = "<AREA id='{id}' target=\"_blank\" onclick='select(this.id);' shape=\"{shape}\" class=\"showTip {name}\" href=\"{href}\" coords=\"{coord}\"/>";
var img_imageEnd   = "\t</MAP>\n";
var img_htmlEnd    ="</BODY>\n"+
					"</HTML>\n";
var img_tmpOutput = " "; // <String> content of the current html file to be generate

var img_TipContent = "{classTip} : {Tip}"
var img_AllToolTips = "" ;
var img_mapDefaultShape = "rect";

var img_htmlTitle = "Auto-Generated with StarUML2HTML AddiN";
var img_fileName;
var img_imageName;

var globalComputeCoords;// the global variable for writing coords in file
var MARGINBIDON = -99999;
var TOP_MARGIN, LEFT_MARGIN;
var CORRECTTOPMARGIN = 20; //10;// 19;//32 ?
var CORRECTLEFTMARGIN = 19; //9;// 18;//32?
var HEIGHTFIELD      = 13; //hauteur (estimee) d'un champs attribut ou operation dans cadre de class
var ARTIFACTHEIGHT   = 30;//70; //hauteur modifiee d'un Artifact
var ARTIFACT_LEFT_MARGIN = 10; //marge gauche modifiee d'un Artifact
var ARTIFACT_TOP_MARGIN  = -5;//11; //marge haute modifiee d'un Artifact
//var TEMPLATEHEIGHT   = 8; //hauteur modifiee d'un class template
var CoordError = false;
/********************************************************************************
* VARIABLES & RESOURCES declaration END                                         *
*********************************************************************************/

/********************************************************************************
* Global Functions                                                              *
*********************************************************************************/
/**
 * return the path of the specified file (in fact, delete the last "/<name>" of the string)
 */
function getOnlyPath(fullDir){
	var baseDir;
	var index = -1;

	index = fullDir.lastIndexOf("/");
	if (index == -1)
		index = fullDir.lastIndexOf("\\");
	if (index == -1)
		app.Log("ERROR: unable to get base dir");

	baseDir = fullDir.substring(0, index);
	return baseDir;
}

/**
 * return the conventional name of the given element (without project name prefixe nor extension)
 * As the elem.GetGuid() function is not available for an element, we can't use it to get a GUID / c'est quand meme vraiment dommage !! #@!%$
 * As Project element dont have Pathname, the title is used instead. Actually, the global variable prjName
 */
function getElemName(elem){
	var name = elem.Pathname;
	name = prj.Title.concat(name);

	// TODO TEST
	//app.Log(" --- name = "+elem.Name+" ; title = "+prj.Title);//TODO TEST
	//app.Log(" --- class name = "+elem.GetClassName());//
	//if (elem.Name != "simpleModel1" /*&& elem.Name != "A"*/) {
	/*
		app.Log(" ---+ elem "+elem.Name);//TODO TEST
		//if (elem.GetClassName() != "UMLModel") {
			app.Log(" -----+ GUID = "+elem.GetGuid());//TODO TEST
		//}
	}*/
	//TODO TEST

	//replace the '::' separators of path by '_'
	while(name.indexOf("::", 1) > 0){
		name = name.replace("::", "_");
	}
	
	//replace " " characters before general replacement with escape because browsers do interpret '%20'
	while(name.indexOf(" ", 1) > 0){
		name = name.replace(" ", "__");
	}
	//replace special characters by ascii code
	name = escape(name);

	//replace not managed special characters: * @ - _ + . /
	while(name.indexOf("*", 1) > 0){
		name = name.replace("*", "%42");
	}
	while(name.indexOf("@", 1) > 0){
		name = name.replace("@", "%64");
	}
	while(name.indexOf("-", 1) > 0){
		name = name.replace("-", "%45");
	}/*
	while(name.indexOf("_", 1) > 0){
		name = name.replace("_", "%95");
	}*/
	while(name.indexOf("+", 1) > 0){
		name = name.replace("+", "%43");
	}
	while(name.indexOf(".", 1) > 0){
		name = name.replace(".", "%46");
	}
	while(name.indexOf("/", 1) > 0){
		name = name.replace("/", "%47");
	}

	//si l'elem n'a pas de nom (apres le dernier "_"), name ne peut pas servir d'id.
	if ( name.lastIndexOf("_", name.length) == name.length-1 ) {
		if ( ! arrayContain(theGlobalNonIdentifierNameList, name)) {
			theGlobalNonIdentifierNameList.push(name);
		}
	}

	//app.Log(" - getElemName: "+name); // TEST
	return name;
}

/**
 * retourne le nom du fichier html de l'element correspondant
 */
function getHtmlElemName(elem){
	var name = getElemName(elem);
	name = name+".html";
	return name;
}

/**
 * creation of folder result, an copy js libs dir
 */
function folderCreation() {
	filesystem = new ActiveXObject("Scripting.FileSystemObject");
	if ( filesystem == null) app.Log("ERROR - unable to manage files") ;

	basePath = prjPathName; //TODO if defined in options, get the user defined path

	//creation du repertoire resultat
	folderName = basePath+"/"+prjName+"_htmlDoc";
	if (!filesystem.FolderExists(folderName)){
		folder = filesystem.CreateFolder(folderName);
	}else{
		// TODO msg "already exist. Replace ?"
		folder = folderName;
	}
	if (folder == null) app.Log("ERROR - unable to create folder "+folder) ;

	//copie des repertoires (js libs)
	copyDir();

	//creation du repertoire pour les properties.html
	propPathToHtmlFiles = folderName+"/"+propPathToHtmlFilesName;
	if (!filesystem.FolderExists(propPathToHtmlFiles)){
		propPathToHtmlFiles = filesystem.CreateFolder(propPathToHtmlFiles);
		app.log("dir "+propPathToHtmlFiles+" created.");//TODO: msg et non log
	}
}

 /**
  * copy of js libs dir
  */
function copyDir() {

	//copie du repertoire mapper (lib JSpour img cliquables)
	var mapperLibFolder = folderName+"/"+mapperLibFolderName+"/";
	if (!filesystem.FolderExists(mapperLibFolder)){
		mapperLibFolder = filesystem.CreateFolder(mapperLibFolder);
		filesystem.CopyFolder(libCommonFolder+"/"+mapperLibFolderName, mapperLibFolder);
		app.log("lib mapper copied to "+mapperLibFolder);//TODO: msg et non log
	}

	//copie du repertoire dw_tooltips (lib JS pour img cliquables)
	var ttLibFolder = folderName+"/"+ttLibFolderName+"/";
	if (!filesystem.FolderExists(ttLibFolder)){
		ttLibFolder = filesystem.CreateFolder(ttLibFolder);
		filesystem.CopyFolder(libCommonFolder+"/"+ttLibFolderName, ttLibFolder);
		app.log("lib dw_tooltips copied to "+ttLibFolder);//TODO: msg et non log
	}

	//copie du repertoire des fichiers MUI (lib JS pour l'arbre)
	var treetoolsFolder = folderName+"/"+treetoolsFolderName+"/";
	if (!filesystem.FolderExists(treetoolsFolder)) {
		treetoolsFolder = filesystem.CreateFolder(treetoolsFolder);
		filesystem.CopyFolder(libCommonFolder+"/"+treetoolsFolderName, treetoolsFolder);
		app.log("lib mootools & mui.tree copied to "+treetoolsFolder);//TODO: msg et non log
	}

	//copie des libs jquery
	var jqueryFolder = folderName+"/"+jqueryFolderName+"/";
	if (!filesystem.FolderExists(jqueryFolder)) {
		jqueryFolder = filesystem.CreateFolder(jqueryFolder);
		filesystem.CopyFolder(libCommonFolder+"/"+jqueryFolderName, jqueryFolder);
		app.log("lib panview copied to "+jqueryFolder);//TODO: msg et non log
	}
	
	app.Log("");

	//copie du repertoire du logo d'accueil
	var logoFolder = folderName+"/"+logoFolderName+"/";
  app.log("logoFolder="+logoFolder) ;
	if (!filesystem.FolderExists(logoFolder)) {
		logoFolder = filesystem.CreateFolder(logoFolder);
		filesystem.CopyFolder("./"+logoFolderName, logoFolder);
	}
}

/**
 * Look for the given string in the given array
 * return true if the string is found, else false
 */
function arrayContain(array, string) {
	var len = array.length;
	for (var i=0; i<len; i++) {
		if (string == array[i]) {
			return true;
		}
	}
	return false;
}

/********************************************************************************
* Global Functions  END                                                         *
*********************************************************************************/










/***************************************************
*		   -= TreeNodeFromModel =-                 *
*    	Script to recursively explore              *
*		the "Model Explorer" of StartUML           *
*                                                  *
*                                                  *
*Author : Paul DUSSERRE                            *
*Last Modification : 24/03/09                      *
*Version :4.1                                      *
*	- Correctif de Bug                             *
*	- Ajout de le Methode IsKindOf a l'objet Node  *
*                                                      *
* Modification : 24/03/09                              *
*       Gregory GOUBET : add diagrams array management *
****************************************************/


/**********           OBJECTS              **********/
var id = 0;
function node(object) {
	this.object = object;
	this.id = id++;
	this.ClassName = object.GetClassName();
	// [[[[  Debut Modif pour l'intégration  ]]]]
	this.IsDiagram = object.IsKindOf("Diagram");
	// [[[[  Fin Modif pour l'intégration  ]]]]

	this.Childs = new Array();

	/*GENERAL :
		- Name : nom de l'objet
		- Visibility : visibilité de l'objet, 0=Public 1=Protected 2=Private 3=Package
		- Pathname : chemin du model exploreur de l'objet, ex : DesignModel::Package1::Classe1
		_ Attachements : Liste des URLs rataché a l'object.
	*/
	if (object.Name == "") {this.Name = " "} else {this.Name = object.Name;}
	this.Visibility = object.Visibility;
	this.Stereotype = object.Stereotype;
	this.Pathname = object.Pathname;
	this.Attachements = new Array();
	/*for ( var i = 0; i < object.GetAttachmentCount(); i++){
		this.Attachements.push(object.GetAttachmentAt(i));
	}*/

	/*OTHER :
		- Type : type de l'attribut
		- InitialValue : valeur initial de l'attribut
	*/
	this.Type = object.Type;
	this.InitialValue = object.InitialValue;

	/* CAN BE ADDED... */
}

node.prototype.IsKindOf = IsKindOf;
function IsKindOf(s) {
	return this.object.IsKindOf(s);
}

node.prototype.getChilds = getChilds;
function getChilds() {
	if (this.Childs.length <= 0) {
		return null ;
	} else {
		return this.Childs;
	}
}

node.prototype.addChild = addChild;
function addChild(node) {
	this.Childs.push(node);
}

/**********          FUNCTIONS             **********/

function logTree(){
	// [[[[  Debut Modif pour l'intégration  ]]]]
	//app.Log(prjName);
	// [[[[  Fin Modif pour l'intégration  ]]]]
	for(var i=0; i< roots.length; i++){
		logChilds(roots[i], 1);
	}
}

function logChilds(elem, n){
	var c = new Array();
	c = elem.getChilds();
	if (c == null) {
		app.Log(myTab(n)+"|- "+elem.Name);
	} else {
		app.Log(myTab(n)+"|- "+elem.Name);
		for(var i=0; i< c.length; i++){
			logChilds(c[i], n+1);
		}
	}
}

function initTree(){
	var elem;
	for(var i=0; i< prj.getOwnedElementCount(); i++){
		elem = new node(prj.getOwnedElementAt(i));
		roots.push(elem);
		exploreModelElement(elem, 1)
	}
}

function exploreModelElement(elem) {
	if (elem.object.IsKindOf("UMLModelElement")){
		//app.Log(myTab(n)+elem.Name);

		switch(true) {
			case elem.object.IsKindOf("UMLNamespace") :
				exploreNamespace(elem);
			break;
			case elem.object.IsKindOf("UMLRelationship") :
			 	exploreRelationship(elem)
			break;
			default :
			break;
		}

	}
// [[[[  Debut Modif pour l'intégration  ]]]]
	//si c'est un diagramme, il faut l'ajouter à l'arbre
	//la liste des diagramme est construite ailleurs
	addDiagrams(elem);
// [[[[  FIN Modif pour l'intégration  ]]]]
}

function exploreNamespace(elem) {

	switch(true) {
		case elem.object.IsKindOf("UMLClassifier") :
			exploreClassifier(elem);
		break;
		default :
		break;
	}

	if (elem.object.getOwnedElementCount() > 0) {
		var curChild;
		for(var i=0; i< elem.object.getOwnedElementCount(); i++){
			curChild = new node(elem.object.getOwnedElementAt(i));
			elem.addChild(curChild);
			exploreModelElement(curChild);
		}
	}

}

function exploreClassifier(elem) {
	if (elem.object.IsKindOf("UMLEnumeration")) {
		exploreEnumeration(elem);
	}
	exploreAttribute(elem);
	exploreOperation(elem);
	explorePort(elem);
	exploreConnector(elem);
	exploreTemplateParameter(elem);
	exploreTypedParameter(elem);
}

function exploreEnumeration(elem) {
	if (elem.object.GetLiteralCount() > 0) {
		var curChild;
		for(var i=0; i< elem.object.GetLiteralCount(); i++) {
			curChild = new node(elem.object.GetLiteralAt(i));
			elem.addChild(curChild);
		}
	}
}

function exploreRelationship(elem) {
	//app.Log("exploreRelationship");
	switch(true) {
		case elem.object.IsKindOf("UMLAssociation") :
			exploreAssociation(elem);
		break;
		case elem.object.IsKindOf("UMLGeneralization") :
		 	exploreGeneralisation(elem);
		break;
		case elem.object.IsKindOf("UMLDependency") :
			exploreDependency(elem);
		break;
		default :
		break;
	}
}

function exploreAssociation(elem){
	if (elem.object.GetConnectionCount() > 0) {
		var curChild;
		for(var i=0; i< elem.object.GetConnectionCount(); i++) {
			curChild = new node(elem.object.GetConnectionAt(i));
			elem.addChild(curChild);
		}
	}
}

function exploreGeneralisation(elem){
	elem.addChild(new node(elem.object.Parent));
	elem.addChild(new node(elem.object.Child));
}

function exploreDependency(elem){
	var Client = elem.object.Client;
	var Supplier = elem.object.Supplier;
	//to do...
}

function exploreAttribute(elem){
	if (elem.object.GetAttributeCount() > 0) {
		var curChild;
		for(var i=0; i< elem.object.GetAttributeCount(); i++) {
			curChild = new node(elem.object.GetAttributeAt(i));
			elem.addChild(curChild);
		}
	}
}

function exploreOperation(elem){
	if (elem.object.GetOperationCount() > 0) {
		var curChild;
		for(var i=0; i< elem.object.GetOperationCount(); i++) {
			curChild = new node(elem.object.GetOperationAt(i));
			elem.addChild(curChild);
			exploreParameter(curChild);
		}
	}
}

function exploreParameter(elem){
	if(elem.object.GetParameterCount() > 0){
		var curChild;
		for(var i=0; i<elem.object.GetParameterCount();i++){
			curChild = new node(elem.object.GetParameterAt(i));
			elem.addChild(curChild);
		}
	}
}

function explorePort(elem){
	if (elem.object.GetOwnedPortCount() > 0) {
		var curChild;
		for(var i=0; i< elem.object.GetOwnedPortCount(); i++) {
			curChild = new node(elem.object.GetOwnedPortAt(i));
			elem.addChild(curChild);
		}
	}
}

function exploreConnector(elem){
	if (elem.object.GetOwnedConnectorCount() > 0) {
		var curChild;
		for(var i=0; i< elem.object.GetOwnedConnectorCount(); i++) {
			curChild = new node(elem.object.GetOwnedConnectorAt(i));
			elem.addChild(curChild);
		}
	}
}

function exploreTemplateParameter(elem){
	if (elem.object.GetTemplateParameterCount() > 0) {
		var curChild;
		for(var i=0; i< elem.object.GetTemplateParameterCount(); i++) {
			curChild = new node(elem.object.GetTemplateParameterAt(i));
			elem.addChild(curChild);
		}
	}
}

function exploreTypedParameter(elem){
	if (elem.object.GetTypedParameterCount() > 0) {
		var curChild;
		for(var i=0; i< elem.object.GetTypedParameterCount(); i++) {
			curChild = new node(elem.object.GetTypedParameterAt(i));
			elem.addChild(curChild);
		}
	}
}

function myTab(nbTab){
	var res = "";
	for(i=0; i<nbTab; i++){
		res = res + "|     ";
	}
	return res;
}

// [[[[  Debut Modif pour l'intégration  ]]]]
/**
 * add to the array "diagramList" the diagrams  of the given metaModel
 */
function addDiagramOf(metaClass){
	var nbElem = metaClass.GetInstanceCount();
	for ( var i = 0; i < nbElem; i++){
		diagramList.push(metaClass.GetInstanceAt(i));
	}
}

/**
 * add the contained diagrams to the Tree
 * param elem the examined node element,
 * elem.object is the StarUML element corresponding to the node object
 */
function addDiagrams(elem) {
	var curChild;
	var nbDiag;

	if (elem.object.IsKindOf("Model")) {
		nbDiag = elem.object.GetOwnedDiagramCount();
		for (var l = 0; l < nbDiag; l++){
			//add this diagram to the tree
			curChild = new node(elem.object.GetOwnedDiagramAt(l));
			elem.addChild(curChild);

			// add this diagram to the global diagram array
			//diagramList.push(elem.object.GetOwnedDiagramAt(l)); done in another function
		}
	}
	if (elem.object.IsKindOf("UMLClassifier")) {
		var colSet;
		var nbColSet = elem.object.GetOwnedCollaborationInstanceSetCount();
		for (var s = 0; s < nbColSet; s++) {
			colSet = elem.object.GetOwnedCollaborationInstanceSetAt(s);
			var intSet;
			var nbIntSet = colSet.GetInteractionInstanceSetCount();
			for (var i = 0; i < nbIntSet; i++) {
				intSet = colSet.GetInteractionInstanceSetAt(i);
				nbDiag = intSet.GetOwnedDiagramCount();
				for (var l = 0; l < nbDiag; l++){
					//add this diagram to the tree
					curChild = new node(intSet.GetOwnedDiagramAt(l));
					elem.addChild(curChild);
				}
			}
		}
	}
}
// [[[[  Fin Modif pour l'intégration  ]]]]










/********************************************************************************
*                           CreateFrame function                                *
* create html and css files (index.html)                                        *
* to organise all the files generated by the sub-tasks                          *
*                                                                               *
* Auteur : GOUBET Gregory                                                       *
* Date : ??/03/09                                                               *
*********************************************************************************/
/**
 * Create a html index file, which link the tree and diagram html files
 */
function createFrame() {
	htmlIndexFile = filesystem.CreateTextFile(folderName+"/"+htmlIndexFileName, true,false);
	app.log("file "+folderName+"/"+htmlIndexFileName+" created.");//TODO: msg et non log

	htmlIndexFile.WriteLine("<HTML>");

	// ecrit le header de la page index
	writeIndexHeader(htmlIndexFile);
	// ecrit le body de la page index
	writeIndexBody(htmlIndexFile);

	htmlIndexFile.WriteLine("</HTML>");
	htmlIndexFile.Close();
}

////////////////////////////// createFrame Functions
/**
 * Write the header of the html file index
 */
function writeIndexHeader(htmlIndexFile){
	htmlIndexFile.WriteLine("<HEAD>");
	htmlIndexFile.WriteLine("<TITLE> "+prjName+" </TITLE>");

	// add JS to underline in diagram image selected element in tree
	htmlIndexFile.WriteLine("<script type=\"text/javascript\" src=\""+mapperLibFolderName+"/selectIndex.js\"></script>\n");


	htmlIndexFile.WriteLine("</HEAD>");
}

/**
 * Write the body of the html file index
 */
function writeIndexBody(htmlIndexFile){
	htmlIndexFile.WriteLine("<FRAMESET COLS=\"20% ,60% , 20%\">");
	htmlIndexFile.WriteLine("<FRAME NAME=\""+treeTargetName+"\" onload=\"addSelectionListener(this.name)\" SRC=\"./"+htmlTreeFileName+"\">");
	//htmlIndexFile.WriteLine("<FRAME NAME=\""+diagramTargetName+"\">");
	htmlIndexFile.WriteLine("<FRAMESET ROWS=\"80% , 20%\">");
	// add src=logofilename to display the logo at first opening
	htmlIndexFile.WriteLine("<FRAME NAME=\""+diagramTargetName+"\" onload=\"addSelectionListener(this.name)\" SRC=\""+logoFolderName+"/"+logoFileName+"\" >");
	htmlIndexFile.WriteLine("<FRAME NAME=\"Display\">"); // plus tard ?  onload=\"addSelectionListener(this.name)\"
	htmlIndexFile.WriteLine("</FRAMESET>");

	htmlIndexFile.WriteLine("<FRAME NAME=\""+propertiesTargetName+"\">"); // plus tard ?  onload=\"addSelectionListener(this.name)\"

	htmlIndexFile.WriteLine("</FRAMESET>");
	htmlIndexFile.WriteLine("<NOFRAMES src=\"./"+htmlTreeFileName+"\">"); // ce que les navigateurs incapable de gerer les frames doivent voir
}










/********************************************************************************
*                    load StarUML Model into JSObject                           *
*                                                                               *
* calls TreeNodeFromModel add-in                                                *
*                                                                               *
*********************************************************************************/
/**
 * generate the object (of type Array ofNode) corresponding to the StarUML project model,
 * and the Array of Diagrams which contains all the diagrams of the project.
 */
function modelExplorer(prj) {
	//construction du tableau de diagrammes
	diagramList = new Array();
	metaClassToStarUmlObjects();

	//Racines de l'arbre == les fils du Project
	roots = new Array();

	//build the object (that can be regarded as a tree) corresponding to the StarUML model
	initTree();
}

/**
 * constructs the diagramList Arrays
 */
function metaClassToStarUmlObjects() {
	var metaClass;

	var nbElem = meta.GetMetaClassCount();
	for (var m = 0; m < nbElem; m++){
		metaClass = meta.GetMetaClassAt(m);
		if (metaClass.IsKindOf("Diagram")) {
			//ajout au tableau de diagrams
			addDiagramOf(metaClass);
		}
	}
}










// ------------------------------------------------------------------------------------------------------------------------
// Debut intégration HTML TREE (cf Tache : HTML tree from javascript)
// ------------------------------------------------------------------------------------------------------------------------
/********************************************************************************
*                           HtmlTree (version 4.1)                              *
*                     Plugin de création de l'arbre HTML                        *
*                                                                               *
* Auteur : ROLLAND Romain                                                       *
* Date : 24/03/09                                                               *
*********************************************************************************/


/**********      Variables globales      **********/


// [[[[  Debut Modif pour l'intégration  ]]]]
/*
var filesystem = new ActiveXObject("Scripting.FileSystemObject");
var htmlTreeFileName = "model_tree.html";
var htmlTreeFile;
var treetoolsFolderLibName = "treetools";
var treetoolsFolderName = treetoolsFolderLibName;
var folderName = "C:\\test_doc2";

var indentCode = true;
*/
// [[[[  Fin Modif pour l'intégration  ]]]]





/**********          FUNCTIONS           **********/

/**
 * ecrit la chaine de caractères "s" dans le fichier "htmlFile"
 * en la faisant précéder de "nbTab" fois une tabulation
 */
function myWriteLine(nbTab, htmlFile, s){
	if(indentCode){
		for(i=0; i<nbTab; i++){
			htmlFile.Write("	");
		}
	}
	htmlFile.WriteLine(s);
}

/**
 * écrit le header du fichier contenant l'arbre
 */
function writeTreeHeader(htmlFile){
	myWriteLine(1,htmlFile,"<HEAD>");
	myWriteLine(2,htmlFile,"<TITLE>Html Tree: "+prjName+"</TITLE>");

// [[[[  Debut Modif pour l'intégration  ]]]]
	myWriteLine(2,htmlFile,"<script type='text/javascript' src='"+mapperLibFolderName+"/selectTree.js'></script>");
// [[[[  FIN Modif pour l'intégration  ]]]]
	myWriteLine(2,htmlFile,"<script type='text/javascript' src='"+treetoolsFolderName+"/mootools-1.2-core.js'></script>");
	myWriteLine(2,htmlFile,"<script type='text/javascript' src='"+treetoolsFolderName+"/mui.tree.js'></script>");

	myWriteLine(2,htmlFile,"<script type='text/javascript'>");
	myWriteLine(2,htmlFile,"	var tree = new MUI.Tree('Bla');");
	myWriteLine(2,htmlFile,"	MUI.Tree.GlobalEvents.addEvent('onExpand', function(tree){");
	myWriteLine(2,htmlFile,"		tree._titleEl.addClass('expanded');");
	myWriteLine(2,htmlFile,"	});");

	myWriteLine(2,htmlFile,"	MUI.Tree.GlobalEvents.addEvent('onCollapse', function(tree){");
	myWriteLine(2,htmlFile,"			tree._titleEl.removeClass('expanded');");
	myWriteLine(2,htmlFile,"	});	");

	myWriteLine(2,htmlFile,"	window.addEvent('domready', function(){");
	myWriteLine(2,htmlFile,"		$('t1').makeAsTree();");
	myWriteLine(2,htmlFile,"	});");

// [[[[  Debut Modif pour l'intégration  ]]]]
/*	myWriteLine(2,htmlFile,"	function select(id){");
	myWriteLine(3,htmlFile,"		self.parent.select(document.getElementById(id));");
	myWriteLine(2,htmlFile,"	}");*/

	myWriteLine(2,htmlFile,"	function loadFrames(linkProp, linkDiag, linkDoc){");
	myWriteLine(2,htmlFile,"		if(linkDiag != ''){");
	myWriteLine(2,htmlFile,"			parent."+diagramTargetName+".location = linkDiag;");
	myWriteLine(2,htmlFile,"		}");
	myWriteLine(2,htmlFile,"		if(linkProp != ''){");
	myWriteLine(2,htmlFile,"			parent."+propertiesTargetName+".location = linkProp;");
	myWriteLine(2,htmlFile,"		}");
	myWriteLine(2,htmlFile,"	}");
// [[[[  Fin Modif pour l'intégration  ]]]]

	myWriteLine(2,htmlFile,"</script>");

	// inclusion du CSS
	myWriteLine(2,htmlFile,"<link title='Style' href='"+treetoolsFolderName+"/createArbre.css' type='text/css' rel='stylesheet'>");

	myWriteLine(1,htmlFile,"</HEAD>");
}

/**
 * Fonction retournant l'id d'un element pour la construction du lien
 */
function htmlTreeGetId(elem){
// [[[[  Debut Modif pour l'intégration  ]]]]
	/*
	var id = elem.Pathname;
	id = id.replace(/::/gi, '_');
	id = id.replace(/ /gi, '_');
	app.Log(id);
	return id;
	*/
	return getElemName(elem);
// [[[[  FIN Modif pour l'intégration  ]]]]
}

/**
 * Fonction recursive qui ecrit l'arbre en parcourant tout les objets
 */
function writeHtmlChild(htmlFile, elem, nbTab){
	var subElems = elem.getChilds();
	myWriteLine(nbTab, htmlFile, "<li>");

// [[[[  Debut Modif pour l'intégration  ]]]]
	// si il n'y a pas d'enfants ou que l'élement est une association
	if (subElems == null || elem.IsKindOf("UMLRelationship")) {
		var phref	= "href='#'"
		var pid		= "id='"+htmlTreeGetId(elem)+"'";
		var pclass	= "class='"+elem.ClassName+"'";
		//var ptarget	= "";
		var onclick_1st_fct = "select(this.id);";
		var onclick_2nd_fct = "loadFrames('"+propPathToHtmlFilesName+"/"+getHtmlElemName(elem)+"','', '');";

		// si c'est un diagram, rajouter le lien de la page html correspondante / ou ne pas l'afficher encore apres les avoir tous mis en haut de l'arbre ?
		if (elem.IsDiagram){
			// mise a jour des frames diagramme et propriété
			onclick_2nd_fct = "loadFrames('"+propPathToHtmlFilesName+"/"+getHtmlElemName(elem)+"','"+getHtmlElemName(elem)+"', '');";
		}

		var ponclick = "onclick=\""+onclick_2nd_fct+onclick_1st_fct+"\"";
		myWriteLine(nbTab+1, htmlFile, "<a "+phref+" "+pid+" "+pclass+" "+ponclick+" >"+elem.Name+"</a>");
		//myWriteLine(nbTab+1, htmlFile, "<a "+phref+" "+pid+" "+pclass+" "+ptarget+" >"+elem.Name+"</a>");

	// si il y a des enfants
	} else {
			/*var phref	= "href='#'"
			var pid		= "id='"+htmlTreeGetId(elem)+"'";
			var pclass	= "class='"+elem.ClassName+"'";
			var ptarget	= "";*/
		var phref	= "href='"+propPathToHtmlFilesName+"/"+getHtmlElemName(elem)+"'"
		var pid		= "id='"+htmlTreeGetId(elem)+"'";
		var pclass	= "class='"+elem.ClassName+"'";
		var ptarget	= "target='"+propertiesTargetName+"'";
// [[[[  Fin Modif pour l'intégration  ]]]]

			myWriteLine(nbTab+1,htmlFile,"<div class='mui-tree'>");
			myWriteLine(nbTab+1,htmlFile,"	<div class='mui-treetitle'><a onclick=\"select(this.id);\" "+phref+" "+pid+" "+pclass+" "+ptarget+" >"+elem.Name+"</a></div>");
			myWriteLine(nbTab+1,htmlFile,"	<ul>");
			// affichage des enfants
			for(var i=0; i< subElems.length; i++){
				writeHtmlChild(htmlFile, subElems[i], nbTab+3);
			}
			myWriteLine(nbTab+1,htmlFile,"	</ul>");
			myWriteLine(nbTab+1,htmlFile,"</div>");
	}
	myWriteLine(nbTab, htmlFile, "</li>");
}


/**
 * écrit le body du fichier contenant l'arbre
 */
function writeTreeBody(htmlFile){
// [[[[  Debut Modif pour l'intégration  ]]]]
	var phref	= "href='"+propPathToHtmlFilesName+"/"+prjName+".html'"
	var pid		= "id='"+prjName+"'";
	var ptarget	= "target='"+propertiesTargetName+"'";
// [[[[  Fin Modif pour l'intégration  ]]]]

	myWriteLine(1,htmlFile,"<BODY>");
	myWriteLine(2,htmlFile,"<div class='container'>");
	myWriteLine(2,htmlFile,"	<div class='mui-tree' id='t1'>");
// [[[[  Debut Modif pour l'intégration  ]]]]
	myWriteLine(2,htmlFile,"		<div class='mui-treetitle'><a onclick=\"select(this.id);\" "+phref+" "+pid+" class='Project' "+ptarget+" >"+prjName+"</a></div>");
	//myWriteLine(2,htmlFile,"		<div class='mui-treetitle'><a href='#' class='Project'>"+prjName+"</a></div>");

	myWriteLine(2,htmlFile,"		<ul>");
	//parcourir tous les diagrammes pour les afficher en premier
	writeHtmlDiagrams(2, htmlFile);
// [[[[  Fin Modif pour l'intégration  ]]]]
	for(var i=0; i< roots.length; i++){
		writeHtmlChild(htmlFile, roots[i], 5);
	}
	myWriteLine(2,htmlFile,"		</ul>");
	myWriteLine(2,htmlFile,"	</div>");
	myWriteLine(2,htmlFile,"</div>");
	myWriteLine(1,htmlFile,"</BODY>");
}

// [[[[  Debut Modif pour l'intégration  ]]]]
/**
 * Permet de générer l'arbre HTML
 */
function generateHtmlTree(){

	htmlTreeFile = filesystem.CreateTextFile(folderName+"/"+htmlTreeFileName, true,false);
	app.log("file "+folderName+"/"+htmlTreeFileName+" created.");//TODO: msg et non log

	htmlTreeFile.WriteLine("<HTML>");

	// ecrit le header de la page contenant l'arbre
	writeTreeHeader(htmlTreeFile);
	// ecrit le body de la page contenant l'arbre
	writeTreeBody(htmlTreeFile);


	htmlTreeFile.WriteLine("</HTML>");
	htmlTreeFile.Close();
}

/**
 * parcours tous les diagrammes pour les afficher
 */
function writeHtmlDiagrams(nbTab, htmlFile) {
	var phref;
	var pid;
	var pclass;
	var onclick_1st_fct = "select(this.id);";
	var onclick_2nd_fct;
	var ponclick;
	
	//myWriteLine(nbTab,htmlFile,"<ul>");
	//get the diagram list
	var nbDiag = diagramList.length; // <int>
	for (var d = 0; d < nbDiag; d++) {
		elem = diagramList[d];
		//...
		phref   = "href='#'";
		pid     = "id='"+htmlTreeGetId(elem)+"'";
		pclass	= "class='"+elem.GetClassName()+"'";
		// mise a jour des frames diagramme et propriété
		onclick_2nd_fct = "loadFrames('"+propPathToHtmlFilesName+"/"+getHtmlElemName(elem)+"','"+getHtmlElemName(elem)+"', '');";
		ponclick = "onclick=\""+onclick_2nd_fct+onclick_1st_fct+"\"";
		myWriteLine(nbTab, htmlFile, "<li>");
		myWriteLine(nbTab+1, htmlFile, "<a "+phref+" "+pid+" "+pclass+" "+ponclick+" >"+elem.Name+"</a>");
		myWriteLine(nbTab, htmlFile, "</li>");
	}
	//myWriteLine(nbTab,htmlFile,"</ul>");
}
// [[[[  FIN Modif pour l'intégration  ]]]]
// ------------------------------------------------------------------------------------------------------------------------
// Fin intégration HTML TREE
// ------------------------------------------------------------------------------------------------------------------------










// ------------------------------------------------------------------------------------------------------------------------
// Debut intégration HTML PROPERTIES (cf Tache : HTML properties from javascript)
// ------------------------------------------------------------------------------------------------------------------------
/********************************************************************************
*                           HtmlProperties (version 3.1)                        *
*          Plugin de création des pages HTML de propriétés d'un objet           *
*                                                                               *
* Auteur : ROLLAND Romain                                                       *
* Date : 23/03/09                                                               *
*                                                                               *
* Modification : 24/03/09   Gregory GOUBET                                      *
*       - creation de la page de proprietes pour le project                     *
*********************************************************************************/

/**********      Globals VARIABLES       **********/
// [[[[  Debut Modif pour l'intégration  ]]]]
/*
var app = new ActiveXObject("StarUML.StarUMLApplication");
var filesystem = new ActiveXObject("Scripting.FileSystemObject");


// si ce répertoire n'existe pas il sera automatiquement créé
var propPathToHtmlFiles = "C:\\test_properties\\";
var propMeta = app.MetaModel;
var propCssFile = "propertySheet.css";
var propTdValueWidth = "160px";
var propTdNameWidth = "110px";


var indentCode = true;
*/
// [[[[  Fin Modif pour l'intégration  ]]]]
/**********          FUNCTIONS           **********/

/**
 * ecrit la chaine de caractères "s" dans le fichier "htmlFile"
 * en la faisant précéder de "nbTab" fois une tabulation
 */
function propWriteLine(nbTab, htmlFile, s){
	if(indentCode){
		for(i=0; i<nbTab; i++){
			htmlFile.Write("	");
		}
	}
	htmlFile.WriteLine(s);
}

// [[[[  Debut Modif pour l'intégration  ]]]]
// cette fonction n'est plus du tout utilisée car on appelle à la place la fonction getHtmlElemName, qui retourne en plus l'extension du fichier
/**
 * Fonction retournant un nom unique pour un element donné
 */
/*function propGetUniqueName(elem){
	var id = elem.Pathname;
	id = id.replace(/::/gi, '_');
	id = id.replace(/ /gi, '_');
//	app.Log(id);
	return id;
}*/
// [[[[  FIN Modif pour l'intégration  ]]]]

/**
 * écrit le header du fichier contenant les propriétés de l'objet "objectName"
 */
function propWriteObjectHeader(htmlFile, objectName){
	propWriteLine(1,htmlFile,"<HEAD>");
	propWriteLine(2,htmlFile,"<TITLE>Html Properties: "+objectName+"</TITLE>");

	// inclusion du CSS
	propWriteLine(2,htmlFile,"<link title='Style' href='./"+propCssFile+"' type='text/css' rel='stylesheet'>");

	propWriteLine(1,htmlFile,"</HEAD>");
}

/**
 * ecrit le fichier css des properties
 */
function propWriteCssFile(){

	// [[[[  Debut Modif pour l'intégration  ]]]]
	//htmlFile = filesystem.CreateTextFile(propPathToHtmlFiles+propCssFile, true);
	var htmlFile = filesystem.CreateTextFile(propPathToHtmlFiles+"/"+propCssFile, true);
	// [[[[  Fin Modif pour l'intégration  ]]]]

	propWriteLine(0,htmlFile,"/*");
	propWriteLine(1,htmlFile,"CSS File for properties Table.");
	propWriteLine(1,htmlFile,"This File was generated by the HtmlProperties StarUml plugin.");
	propWriteLine(0,htmlFile,"*/");
	propWriteLine(0,htmlFile,"");
	propWriteLine(0,htmlFile,"/* CSS of the table */");
	propWriteLine(0,htmlFile,".propTable{");
	propWriteLine(0,htmlFile,"	border-spacing: 0px;");
	propWriteLine(0,htmlFile,"	font-size: 12px;");
	propWriteLine(0,htmlFile,"	border: 1px solid #000000;");
	propWriteLine(0,htmlFile,"	empty-cells: show;");
	propWriteLine(0,htmlFile,"}");
	propWriteLine(0,htmlFile,"");
	propWriteLine(0,htmlFile,"/* CSS for left cell of the table */");
	propWriteLine(0,htmlFile,".propTdL{");
	propWriteLine(0,htmlFile,"	width: "+propTdNameWidth+";");
	propWriteLine(0,htmlFile,"}");
	propWriteLine(0,htmlFile,"");
	propWriteLine(0,htmlFile,"/* CSS for right cell of the table */");
	propWriteLine(0,htmlFile,".propTdR{");
	propWriteLine(0,htmlFile,"	width: "+propTdValueWidth+";");
	propWriteLine(0,htmlFile,"");
	propWriteLine(0,htmlFile,"}");
	propWriteLine(0,htmlFile,"");
	propWriteLine(0,htmlFile,"/* CSS on all line of the table */");
	propWriteLine(0,htmlFile,".propTable tr{");
	propWriteLine(0,htmlFile,"	background-color: #FFFFFF;");
	propWriteLine(0,htmlFile,"}");
	propWriteLine(0,htmlFile,"");
	propWriteLine(0,htmlFile,"/* CSS on mouse over on a line of the table */");
	propWriteLine(0,htmlFile,".propTable tr:hover{");
	propWriteLine(0,htmlFile,"	background-color: #EEEEEE;");
	propWriteLine(0,htmlFile,"}");
	propWriteLine(0,htmlFile,"");
	propWriteLine(0,htmlFile,"/* CSS on all cell of the table */");
	propWriteLine(0,htmlFile,".propTable tr td{");
	propWriteLine(0,htmlFile,"	padding-right: 10px;");
	propWriteLine(0,htmlFile,"	padding-left: 10px;");
	propWriteLine(0,htmlFile,"	border: 1px solid #000000;");
	propWriteLine(0,htmlFile,"}");
	propWriteLine(0,htmlFile,"");


	htmlFile.Close();
}


/**
 * écrit le body du fichier contenant les propriétés de l'objet "elem"
 */
function propWriteObjectBody(htmlFile, elem){
	propWriteLine(1,htmlFile,"<BODY>");

	// [[[[  Debut Modif pour l'intégration  ]]]]
	//var metaClass = propMeta.FindMetaClass(elem.ClassName);
	var metaClass = meta.FindMetaClass(elem.ClassName);
	// [[[[  Fin Modif pour l'intégration  ]]]]

	propWriteLine(2,htmlFile,"<TABLE class='propTable'>");

	for (var i = 0; i < metaClass.GetMetaAttributeCount(); i++){
		var metaAttr = metaClass.GetMetaAttributeAt(i);

		propWriteLine(3,htmlFile,"<TR class='propTr'>");
		propWriteLine(4,htmlFile,"<TD class='propTdL'>"+metaAttr.Name+"</TD>");

		propWriteLine(4,htmlFile,"<TD class='propTdR'>"+elem.object[metaAttr.Name]+"</TD>");
		propWriteLine(3,htmlFile,"</TR>");
	}

	propWriteLine(2,htmlFile,"</TABLE>");
	propWriteLine(1,htmlFile,"</BODY>");
}

/**
 * Fonction qui ecrit le fichier de propriété html d'un objet donné
 */
function propWriteHtmlFileFor(elem){
// [[[[  Debut Modif pour l'intégration  ]]]]
/*	var htmlFile;
	htmlFile = filesystem.CreateTextFile(propPathToHtmlFiles+propGetUniqueName(elem)+".html", true);*/
	var htmlFile = filesystem.CreateTextFile(propPathToHtmlFiles+"/"+getHtmlElemName(elem), true, false); // propGetUniqueName
// [[[[  Fin Modif pour l'intégration  ]]]]

	htmlFile.WriteLine("<HTML>");
	propWriteObjectHeader(htmlFile, elem.Name);
	propWriteObjectBody(htmlFile, elem);
	htmlFile.WriteLine("</HTML>");

	htmlFile.Close();
}

/**
 * Fonction recursive qui ecrit les fichiers html en parcourant
 * tout les objets enfant de l'objet donné
 */
function propWriteRecHtmlFile(elem){
	var subElems = elem.getChilds();

	// si il n'y a pas d'enfants
	if (subElems == null) {
		propWriteHtmlFileFor(elem);
	// si il y a des enfants
	} else {
		propWriteHtmlFileFor(elem);
		for(var i=0; i< subElems.length; i++){
			propWriteRecHtmlFile(subElems[i]);
		}
	}
}

// [[[[  Debut Modif pour l'intégration  ]]]]
/**
 * Genere les fichiers html de Property pour chaque element de l'arbre
 * (cf Taches: Html Properties from JaveScript)
 */
function propGenerateHtmlProperties() {
	// création du fichier css
	propWriteCssFile();

	//creation du fichier de proprietes pour le projet, qui n'est pas dans les roots
	prjNode = new node(prj);
	propWriteRecHtmlFile(prjNode);

	// création du fichier de propriétés pour chaque objet parcouru
	for(var i=0; i< roots.length; i++){
		propWriteRecHtmlFile(roots[i]);
	}
}
// [[[[  Fin Modif pour l'intégration  ]]]]










/********************************************************************************
*                 JReverse add-in (version 1.7)                                 *
*              foreach diagram, create img + html file                          *
*                                                                               *
* Auteurs: BIOTEAU Romain & GOUBET Gregory                                      *
* Date : ??/03/09                                                               *
*********************************************************************************/
// [[[[  Debut Modif pour l'intégration  ]]]]
/**
 * for each diagram stored in diagramList, creates corresponding html and img files
 * (cf Taches: JReverse)
 */
function mappedImages() {
	var diagram; // <Diagram>
	var nbDiag = diagramList.length; // <int>

	//call the calculMargin function first to be sure having done coordinate computation one time and get the right global margins
	globalComputeCoords = false; // set the global variable for writing coords in file
	diagramCoordFirstComputation(diagramList);

	globalComputeCoords = true; // set the global variable for writing coords in file
	//foreach diagram in diagramList, call DiagramScan function which creates corresponding html and img files
	for (var d = 0; d < nbDiag; d++) {
		diagram = diagramList.pop();
		DiagramScan(diagram);
	}
	/*
	// if error happend while computing coords, global error var "CoordError" is true
	if (CoordError) {
		app.Log("");
		app.Log(" --- problem while computing diagrams coordinates - ");
		app.Log(" please note that if you run this plugin for the first time before opening any diagram, coordinates cant be computed correctly. Just restart the plugin.");
	}*/
}
// [[[[  Fin Modif pour l'intégration  ]]]]


////////////////////////////// mappedImages Functions
/*
 * calcul les marges de la vue associee
 * exporte la vue associee
 * parcours les elements du modele pour repertorier les hrefs
*/
function DiagramScan(diagram){
	var elem; //Model
	var diagramView; //DiagramView
	var tmpFileName;

	img_tmpOutput = ""; //le contenu du fichier html
	diagramView =  diagram.DiagramView ;

	calculMargin(diagramView);
	TOP_MARGIN = TOP_MARGIN - CORRECTTOPMARGIN;
	LEFT_MARGIN = LEFT_MARGIN - CORRECTLEFTMARGIN;
	//app.Log(" --- calcul margins = "+LEFT_MARGIN+", "+TOP_MARGIN);//TEST

	//nom des html et jpg
	tmpFileName = getElemName(diagram);
	img_fileName = tmpFileName+".html";//getHtmlElemName(diagram);
	img_imageName = tmpFileName+".jpg";

	//entete html file
	img_tmpOutput = img_tmpOutput.concat(img_htmlHeader.replace("{html_title}", diagram.Name));
	img_tmpOutput = img_tmpOutput.concat(img_imageHeader.replace("{id}", tmpFileName).replace("{imageName}", img_imageName).replace("{mapName}", diagram.Name+"map").replace("{mapName}", diagram.Name+"map"));
	elem = diagram.DiagramOwner;

	//ModelScan(elem);
	DiagramElemScan(diagram);

	//ajout des tooltips
	img_tmpOutput = img_tmpOutput.concat(img_imageEnd);
	img_tmpOutput = img_tmpOutput.replace("{TipContent}",img_AllToolTips);
	//ajout du nom du diagramme
	img_tmpOutput = img_tmpOutput.replace("{diagName}", getElemName(diagram)).replace("{diagName}", getElemName(diagram));

	img_tmpOutput = img_tmpOutput.concat(img_htmlEnd);

	//export img + creation html file
	//diagramView.ExportDiagramAsJPEG(folderName+"/"+img_imageName);//TODO: verifier s'il n'existe pas deja
	//app.log("file "+folderName+"/"+img_imageName+" created.");//TODO: msg et non log

	var output = filesystem.CreateTextFile(folderName+"/"+img_fileName,true,false);//TODO: verifier s'il n'existe pas deja
	output.write(img_tmpOutput)
	output.close();

	if (output == null)
		app.Log("ERROR");
	else
		app.log("file "+folderName+"/"+img_fileName+" created");//TODO: msg et non log
}

/**
 * calcul des marges TOP et LEfT
 * parcours de la vue donnee
 * pour chaque element de la vue, comparer les Top et Left avec les minimas retenus
 * (parcours des vues et non du modele car l'on s'interesse aux images)
 */
function calculMargin(dgView){
	var nbView; // <int>
	var view; //<IView>
	var edgePoints; // <IPoints>
	var nbPoints; // <int>
	var tmpTop; // <int>
	var tmpLeft; // <int>
	var labelView; // <NodeView> IEdgeLabelView OR IUMLQualifierCompartmentView, both inherit NodeView

	var nbConnec;
	var connec; // <UMLAssociationEnd>

	TOP_MARGIN  = MARGINBIDON;
	LEFT_MARGIN = MARGINBIDON;

	if(dgView != null){
		nbView = dgView.GetOwnedViewCount();
		for (var i = 0; i < nbView; i++){
			view = dgView.GetOwnedViewAt(i);

			if (view == null){
				if (dgView.GetClassName() != "UMLComponentDiagramView") { //pb connu pour cette classe
					app.Log("no view - please contact us to report this error (ERREUR 202 - missing view for \""+dgView.Name+"\" of type \""+dgView.GetClassName()+"\")");// TODO TEST
				}
			}
			else{
				clView = view.GetClassName();

				// for the IEdgeView, get the collection of points
				if(clView == ("UMLAssociationView") || (clView == "UMLNoteLinkView") || (clView == "UMLGeneralizationView") || (clView == "UMLDependencyView")){
					edgePoints = view.Points;
					nbPoints = edgePoints.GetPointCount();
					for(var p=0; p < nbPoints; p++){
						tmpTop  = edgePoints.GetPointY(p);
						tmpLeft = edgePoints.GetPointX(p);

						if(tmpTop > 0 && tmpLeft > 0){
							if((TOP_MARGIN == MARGINBIDON) || (tmpTop < TOP_MARGIN)){
								TOP_MARGIN = tmpTop;}
							if((LEFT_MARGIN == MARGINBIDON) || (tmpLeft < LEFT_MARGIN)){
								LEFT_MARGIN = tmpLeft;}
						}
					}
					// si Association like, traiter les roles
					if (view.Model != null && view.Model.isKindOf("UMLRelationship")) { // == ("UMLAssociationView")
						// les associations
						calculNodeMargin(view.NameLabel); // <IEdgeLabelView>
						calculNodeMargin(view.StereotypeLabel); // <IEdgeLabelView>

						// les roles
						calculNodeMargin(view.HeadRoleNameLabel); // <IEdgeLabelView>
						calculNodeMargin(view.TailRoleNameLabel); // <IEdgeLabelView>
						calculNodeMargin(view.HeadMultiplicityLabel); // <IEdgeLabelView>
						calculNodeMargin(view.TailMultiplicityLabel); // <IEdgeLabelView>
						calculNodeMargin(view.TailPropertyLabel); // <IEdgeLabelView>
						calculNodeMargin(view.HeadPropertyLabel); // <IEdgeLabelView>
						calculNodeMargin(view.HeadQualifierCompartment); // ???
						calculNodeMargin(view.TailQualifierCompartment); // ???
					}
				}
				else /* if(clView == "UMLClassView" || clView == "UMLNoteView" || clView == "UMLArtifactView")*/{
					calculNodeMargin(view);
				}
			}
		}
		//app.Log(" --- TEST: MARGINS = "+TOP_MARGIN+", "+LEFT_MARGIN);//TEST
	}
}

/**
 * calcul des marges Top et Left pour les vues de type NodeView
 * (factorisation de code...)
 */
function calculNodeMargin(nodeView){
	var tmpTop; // <int>
	var tmpLeft; // <int>

	if(nodeView != null && nodeView.isKindOf("NodeView")) {
		tmpTop  = nodeView.Top;
		tmpLeft = nodeView.Left;

		if(tmpTop > 0 && tmpLeft > 0){
			if((TOP_MARGIN == MARGINBIDON) || (tmpTop < TOP_MARGIN)){
				TOP_MARGIN = tmpTop;}
			if((LEFT_MARGIN == MARGINBIDON) || (tmpLeft < LEFT_MARGIN)){
				LEFT_MARGIN = tmpLeft;}
		}
	}
}

/**
 * parcours les elements contenus dans le diagramme donne,
 * afin d'obtenir les coordonnes des elements pour les ecrire dans le fichier html "courant" (img_tmpOutput )
 * retourne "#" en cas d'erreur pendant le calcul des coordonnees, sinon " " ou une chaine de forme "x1,y1,x2,y2"
 */
function DiagramElemScan(diagram){
	var diagView = diagram.DiagramView; //DiagramView
	var nbElem = diagView.GetOwnedViewCount();
	var elem; //Model
	var clName; //String
	var elemView; //View

	//app.Log(" --- DiagramElemScan: name = "+diagram.DiagramOwner.Name+" ; nbElem = "+nbElem); // TEST

	for (var n = 0; n < nbElem; n++){
		elemView = diagView.GetOwnedViewAt(n);
		if (elemView != null){
			elem = elemView.Model;
			if (elem != null){
				clName = elem.GetClassName();

				//app.Log(" --- -> elem "+n+", class "+clName+", name "+elem.Name); // TEST

				if (elemView.IsKindOf("NodeView")){
					//if (elem.IsKindOf("UMLClassifier")) {
					if(clName == "UMLClass"){ //traitement special pour class (attributes & methods)
						areaClassView(elemView);
					}
					else {
						areaNodeNotClassView(elemView);
					}
				}
				else if (elemView.Model.IsKindOf("UMLRelationship")) { // si Association like, traiter les roles
					// les associations
					areaNodeNotClassView(elemView.NameLabel); // <IEdgeLabelelemView>
					areaNodeNotClassView(elemView.StereotypeLabel); // <IEdgeLabelView>

					// les roles
					areaNodeNotClassView(elemView.HeadRoleNameLabel); // <IEdgeLabelView>
					areaNodeNotClassView(elemView.TailRoleNameLabel); // <IEdgeLabelView>
					areaNodeNotClassView(elemView.HeadMultiplicityLabel); // <IEdgeLabelView>
					areaNodeNotClassView(elemView.TailMultiplicityLabel); // <IEdgeLabelView>
					areaNodeNotClassView(elemView.TailPropertyLabel); // <IEdgeLabelView>
					areaNodeNotClassView(elemView.HeadPropertyLabel); // <IEdgeLabelView>
					//areaNodeNotClassView(elemView.HeadQualifierCompartment); // ???
					//areaNodeNotClassView(elemView.TailQualifierCompartment); // ???
				}
				else if (elemView.IsKindOf("EdgeView")) {
					// ne rien faire / si ! gerer les UMLStimulus !
					areaEdgeView(elemView);
				}
				else {
					app.log("   --- Type non pris en compte (\""+clName+"\"). Merci de nous le rapporter ! :)");
				}
			}/*
			else { //elem == null
				//impossible d'obtenir elemView.GetMetaClass ni elemView.GetClassName...
				//Notes come here
			}*/
		}
		//else ???
		//Artifacts come here => parcours du model pour les Artifacts... // ??? ou apres la boucle ?

		//app.Log(" boucle: testCoord = "+testCoord); // TEST
	}

	//search for Artifacts, which views are not returned by diagram
	scanArtifact(diagram.DiagramOwner, diagView); // carefull, diagramOwner can be of UMLInteractionInstanceSet class type

	//pas de parcours recursif des diagrammes contenus dans les elements, car cette fonction est deja appelee pour tous les diagrammes independamment de leur hierarchie
}

/**
 * TODO
 */
function scanArtifact(model, diagramView){
	var nbElem; //int
	var elem; //Model
	var clName; //String
	var classView; //View
	var nbViews; //int
	var artView; //View

	if (model != null&& model.IsKindOf("UMLModel")) {
		nbElem = model.GetOwnedElementCount();
		for (var i = 0; i < nbElem; i++){
			elem = model.GetOwnedElementAt(i);
			clName = elem.GetClassName();
			if(clName == "UMLArtifact"){
				//pour toutes les vues de cet Artifact qui apparaissent dans le diagramme, ajouter une Area
				nbViews = elem.GetViewCount();
				for (var v = 0; v < nbViews; v++){
					//en fait, il y a 3 vues par Artifact, la 1re vaut null, la 3e est (toujours ?) < la 2e
					if (v % 3 == 1){
						artView = elem.GetViewAt(v);
						//if ((artView != null) && (artView.GetDiagramView() == diagramView)){ devient inutile
						areaArtifact(artView);
						//}
					}
				}
			}
		}
	}
}

/**
 * TODO
 */
function areaArtifact(artView){
	var coord = artifactCoord(artView);
	AddMapArea(artView.Model, coord);
}

/**
 * TODO
 */
function areaEdgeView(edgeView){

	if (edgeView.IsKindOf("UMLCustomSeqMessageView")) {
		var nameLabel = edgeView.NameLabel; // <EdgeLabelView> kind of <NodeView>
		var stereotypeLabel = edgeView.StereotypeLabel; // <EdgeLabelView> kind of <NodeView>
		areaNodeNotClassView(nameLabel);
		areaNodeNotClassView(stereotypeLabel);
	}
}

/**
 * TODO
 */
function areaClassView(classView){
	var elem = classView.Model;
	var attrView = classView.AttributeCompartment;
	var operView = classView.OperationCompartment;
	var coord = classCoord(classView);

	//app.Log(" --- areaClassView: coord = "+coord);//TEST
	if (coord != " ") {
		AddMapArea(classView.Model, coord);

		//les attributs de la classe
		if(elem.GetAttributeCount() != 0 && attrView.Visible){
			for (var j = 0; j < elem.GetAttributeCount(); j++){
				attrElem = elem.GetAttributeAt(j);
				coord = fieldsCoord(attrView, j);
				AddMapArea(attrElem, coord);
			 }
		}

		//les operations de la classe
		if(elem.GetOperationCount() != 0 && operView.Visible){
			for (var k = 0; k < elem.GetOperationCount(); k++){
				opElem = elem.GetOperationAt(k);
				coord = fieldsCoord(operView, k);
				AddMapArea(opElem, coord);
			 }
		}
	}
	//app.Log(" --- areaClassView end: coord = "+coord);//TEST
}

/**
 * TODO
 */
function areaNodeNotClassView(classView){
	var coord;

	if (classView != null && classView.Model != null) {
		coord = classCoord(classView);
		//app.Log(" --- areaNodeNotClassView: coord = "+coord); // TEST
		if (coord != " ") {
			AddMapArea(classView.Model, coord);
		}
	}
}

/**
 * TODO
 * if negative coords (error), set global var to true
 */
function fieldsCoord(fieldView, num){
	var x1 = fieldView.Left - LEFT_MARGIN ;
	//if (x1 < 0) return "#"; // if negative, return error code
	if (x1 < 0) CoordError = true;

	var y1 = fieldView.Top - TOP_MARGIN + (num * HEIGHTFIELD) + 2; //tenir compte du decalage
	var x2 = x1 + fieldView.Width;
	var y2 = y1 + HEIGHTFIELD + 2;
	var coord = x1+","+y1+","+x2+","+y2;

	return coord;
}

/**
 * TODO
 * if negative coords (error), set global var to true
 */
function classCoord(classView){
	var nameClassView;
	var tmpLeft;
	var tmpTop;
	var coord = " ";

	if (classView != null) {
		nameClassView = classView.NameCompartment;

		if (nameClassView == null) {
			nameClassView = classView;
		}

		tmpLeft = nameClassView.Left;
		tmpTop  = nameClassView.Top;
		if ((tmpLeft > 0) && (tmpTop > 0)) {
			var x1 = tmpLeft - LEFT_MARGIN;
			var y1 = tmpTop - TOP_MARGIN;
			var x2 = x1 + nameClassView.Width;
			var y2 = y1 + nameClassView.Height;

			coord = x1+","+y1+","+x2+","+y2;
		}
		else
			CoordError = true;
	}
	//app.Log(" === class coord = "+coord); // TEST
	return coord;
}

/**
 * TODO
 * if negative coords (error), set global var to true
 */
function artifactCoord(classView){
	var x1 = classView.Left - LEFT_MARGIN + ARTIFACT_LEFT_MARGIN;
	//if (x1 < 0) return "#"; // if negative, return error code
	if (x1 < 0) CoordError = true;

	var y1 = classView.Top - TOP_MARGIN + ARTIFACT_TOP_MARGIN;
	var x2 = x1 + classView.Width - 2;
	var y2 = y1 + classView.Height + ARTIFACTHEIGHT;//TODO: determiner pourquoi la hauteur retournee est parfois reduite ?! / parce que le cadre a ete redimentionne ?
	var coord = x1+","+y1+","+x2+","+y2;

	return coord;
}

/**
 * TODO
 */
function AddMapArea(elem, coord, shape){
	// if globalComputeCoords is false, dont add map area
	if (globalComputeCoords) { 
		var content;
		var href;
		var id;
		var shape = ' '; //TODO possibility to give the shape on argument => default param: shape  = ' '... in JS ?

		if(elem.Attachments == null || elem.Attachments == "")
			href="#";
		else{
			//app.Log(" --- TEST: href = "+elem.Attachments);//TEST
			href=elem.Attachments;
		}

		if(elem.Documentation == null || elem.Documentation == ""){
			content = " ";
		}else{
			content = elem.Documentation ;
			//app.Log(" --- TEST: Documentation coord = "+coord); //TEST
			addTooltipFeature(elem.Name,content);
		}

		//if(content != " " ||  href != "#" ){ -> dans tous les cas, faire une area !!
			if (shape == ' ') {
				shape = img_mapDefaultShape;
			}

			id = getElemName(elem);
			//app.Log(" --- TEST: AddMapArea: name = "+elem.Name+", content = "+content+", href = "+href+", coord = "+coord+", shape = "+shape);//TEST
			img_tmpOutput =  img_tmpOutput.concat(createMapFeature(id, elem.Name, shape, href, coord, content));
		//}
	}
}

/**
 * TODO
 */
function createMapFeature(id, name, shape, href, coord, content) {
	var tmp = img_mapItem;

	tmp = tmp.replace("{id}", id);
	tmp = tmp.replace("{coord}", coord);

	if(shape != '')
		tmp = tmp.replace("{shape}", shape);
	else
		tmp = tmp.replace("{shape}", mapDefaultShape);

	if(href == "#"){
		tmp = tmp.replace("href=\"{href}\" ", "");
	}
	else {
		tmp = tmp.replace("{href}", href);
	}

	if(content == null || content == ""){
		tmp = tmp.replace("class=\"showTip {name}\" ", "");
	}
	else {
		tmp = tmp.replace("{name}", name);
	}

	return "\t\t" + tmp +"\n";
}

/**
 * TODO
 */
function addTooltipFeature(elem, content){
	var tmp = img_TipContent ;

	tmp = tmp.replace("{classTip}",elem);
	tmp = tmp.replace("{Tip}",'\''+content+'\'');

	if(img_AllToolTips == "" || img_AllToolTips == null){
		img_AllToolTips = img_AllToolTips.concat(tmp);
	}else{
		img_AllToolTips = img_AllToolTips.concat(",\n");
		img_AllToolTips = img_AllToolTips.concat(tmp);
	}

	return tmp;
}


// [[[[  Debut Modif pour l'intégration  ]]]]
/**
 * Computes all coordinates during a first diagrams scan, to get the right global margins
 * FIXME There is a bug in the computation of coordinates
 * exports the image files (twice because of bad coordinate on the first loop
 */
function diagramCoordFirstComputation(diagramList) {
	var nbDiag = diagramList.length; // <int>
	var diagramView; //<DiagramView>
	var img_imageName; // <string>

	//foreach diagram in diagramList, call DiagramScan function which creates corresponding html and img files
	for (var d = 0; d < nbDiag; d++) {
		diagram = diagramList[d];
		diagramView = diagram.DiagramView;
		calculMargin(diagramView);
	}
	for (var d = 0; d < nbDiag; d++) {
		diagram = diagramList[d];
		diagramView =  diagram.DiagramView;
		img_imageName = getElemName(diagram)+".jpg";
    // FIXME add this because it sometimes create errors
    try {
		  diagramView.ExportDiagramAsJPEG(folderName+"/"+img_imageName);//TODO: verifier s'il n'existe pas deja
    } catch(e) {
      app.log("ERROR when saving "+img_imageName) ;
    }
	}
  // 
	for (var d = 0; d < nbDiag; d++) {
		diagram = diagramList[d];
		diagramView =  diagram.DiagramView;
		img_imageName = getElemName(diagram)+".jpg";
    // FIXME commented because it sometimes create errors
		// diagramView.ExportDiagramAsJPEG(folderName+"/"+img_imageName);//TODO: verifier s'il n'existe pas deja
		app.log("file "+folderName+"/"+img_imageName+" created.");//TODO: msg et non log
	}
}
// [[[[  FIN Modif pour l'intégration  ]]]]










/********************************************************************************
*                              MAIN function                                    *
*                               entry point                                     *
*********************************************************************************/
/**
 * The first function to be called by the add-in
 */
function main () {

	app = new ActiveXObject("StarUML.StarUMLApplication");
	app.Log("");
	app.Log("");
	app.log("   ===== Doc Generation (html pages) =====");//TODO: msg et non log

	meta = app.MetaModel;
	prj = app.GetProject(); // project object
	prjName = prj.Title; // project name
	prjPathName = app.ProjectManager.ProjectDocument.FileName; //full name (with path)
	htmlTitle = prjPathName; // title of the tab in explorer
	htmlTreeFileName = prjName+"_tree.html"; // name of the html tree file
	prjPathName = getOnlyPath(prjPathName); //only path of project file

	//get the options of the add-in
	launchBrowserAutomatically = app.GetOptionValue(StarUML2HTMLSchemaID, "launchBrowserAutomatically");
	indentCode = app.GetOptionValue(StarUML2HTMLSchemaID, "indentCode");
	//app.Log(" --- options: browswer = "+launchBrowserAutomatically+" ; indent = "+indentCode);//TEST

	//result folder creation and copy of js libs dir
	folderCreation();

	////call "sub-tasks"
	// frame
	createFrame();

	// load model object
	modelExplorer(prj);
	//logTree(); // TEST

	// html tree
	generateHtmlTree();

	// elem properties
	propGenerateHtmlProperties();

	// mapped images
	mappedImages();

	//warning messages
	var theGlobalNonIdentifierNameListLength = theGlobalNonIdentifierNameList.length;
	if (theGlobalNonIdentifierNameListLength > 0) {
		app.Log("");
		app.Log(" - The following elements don't have proper name, that may produce conflicts when selecting them in generated html files : ");
		for (var i = 0; i < theGlobalNonIdentifierNameListLength;i++) {
			app.Log(" --- Name \""+theGlobalNonIdentifierNameList.pop()+"\" cannot be used as identifier ---");
		}
	}

	app.Log("");


	// open web browser
	if (launchBrowserAutomatically) {
		app.log("   ===== Done : open web browser =====");//TODO: msg et non log
		new ActiveXObject("Shell.Application").ShellExecute(folderName+"/"+htmlIndexFileName);
	}
	else {
		app.log("   ===== Done =====");//TODO: msg et non log
	}
}



/********************************************************************************
*                                add-in body                                    *
*                     call the main function (entry point)                      *
*********************************************************************************/
main();
