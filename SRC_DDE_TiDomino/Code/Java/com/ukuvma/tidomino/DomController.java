package com.ukuvma.tidomino;

import java.io.Serializable;
import java.io.StringWriter;
import java.util.Iterator;

import lotus.domino.Database;
import lotus.domino.Document;
import lotus.domino.DocumentCollection;
import lotus.domino.Item;
import lotus.domino.Session;
import lotus.domino.View;

import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.commons.util.io.json.JsonParser;
import com.ibm.xsp.model.domino.DominoUtils;

public class DomController implements Serializable {
	private static final long serialVersionUID = 7241244761759691945L;

	@SuppressWarnings("finally")
	public String processObjectRequest(String jsonText) {
		// VARIABLES
		StringWriter sw = new StringWriter();
		String myresult = "";
		String tempResult = "";

		try {
			// System.out.println(jsonText.toString());
			JsonJavaFactory factory = JsonJavaFactory.instanceEx;
			JsonJavaObject json = (JsonJavaObject) JsonParser.fromJson(factory,
					jsonText);
			
			switch (Integer.parseInt(json.getString("processType"))) {
			case 1:
				tempResult = _processNotesDocumentCollection(json);

				if (tempResult == null) {
					myresult = '{'
							+ "\"success\":false"
							+ ",\"description\":\"Java Error: _processNotesDocumentCollection()\""
							+ "}";
				} else {
					myresult = "{" + "\"success\":true"
							+ ",\"description\":\"Passed\""
							+ ",\"DocumentCollection\":" + tempResult + "}";
				}					
				
				break;
				
			case 2:
				tempResult = _processSaveNotesDocument(json);

				if (tempResult == null) {
					myresult = '{'
							+ "\"success\":false"
							+ ",\"description\":\"Java Error: _processSaveNotesDocument()\""
							+ "}";
				} else {
					myresult = "{" + "\"success\":true"
							+ ",\"description\":\"Passed\""
							+ "," + tempResult;
				}				
				
				break;				
			}
		} catch (Exception e) {
			e.printStackTrace();
			myresult = '{' + "\"success\":false"
					+ ",\"description\":\"Java Error: processObjectRequest()\""
					+ "}";
		} finally {
			sw.write(myresult);
			return sw.toString();
		}
	}

	@SuppressWarnings("finally")
	private String _processNotesDocumentCollection(JsonJavaObject json) {
		String myresult = "{";

		try {
			Session ss = DominoUtils.getCurrentSession();
			Database db = ss.getDatabase(json.getString("serverName"), json
					.getString("filePath"));
			
			if(!db.isOpen()){
				myresult = '{' + "\"success\":false"
				+ ",\"description\":\"Connection to Notes Database failed\"";
				return myresult;
			}			
			
			View view = db.getView(json.getString("viewName"));
			
			if(view == null){
				myresult = '{' + "\"success\":false"
				+ ",\"description\":\"NotesView is null\"";
				return myresult;
			}		
			
			DocumentCollection col = view.getAllDocumentsByKey(json
					.getString("key"), json.getBoolean("exactMatch"));
			Document doc = null;
			Document tempDoc = null;
			Item item = null;
			String temparray = json.getString("fields");
			String[] myarray = temparray.split(",");
			// NotesDocumentCollection Properties
			myresult += "\"Count\":" + String.valueOf(col.getCount());
			myresult += ",\"IsSorted\":" + String.valueOf(col.isSorted());
			String tempval;

			// Prepare NotesDocument Array
			int index = 0;
			String myresult2 = "[";

			if (col.getCount() > 0) {
				doc = col.getFirstDocument();

				while (doc != null) {
					if (index > 0) {
						myresult2 += ",";
					}

					myresult2 += "{";
					myresult2 += "\"index\":" + index;
					myresult2 += ",";
					myresult2 += "\"IsModified\":false";
					myresult2 += ",";
					myresult2 += "\"UniversalID\":\"" + doc.getUniversalID() + "\"";
					myresult2 += ",";
					myresult2 += "\"NoteID\":\"" + doc.getNoteID() + "\"";

					for (int x = 0, y = myarray.length; x < y; x++) {
						item = doc.getFirstItem(myarray[x]);
						myresult2 += ",";

						if (item == null) {
							myresult2 += "\"" + myarray[x] + "\":null";
						} else {
							switch (item.getType()) {
							case Item.ACTIONCD:
							case Item.ASSISTANTINFO:
							case Item.ATTACHMENT:
							case Item.COLLATION:
							case Item.EMBEDDEDOBJECT:
							case Item.ICON:
							case Item.OTHEROBJECT:
							case Item.QUERYCD:
							case Item.SIGNATURE:
							case Item.UNAVAILABLE:
							case Item.UNKNOWN:
							case Item.VIEWMAPDATA:
							case Item.VIEWMAPLAYOUT:
							case Item.ERRORITEM:
								myresult2 += "\"" + item.getName() + "\":null";
								break;
							case Item.NUMBERS:
								tempval = "[";
								if (item.getText().equals("")) {
									tempval += "0";
								} else {
									for (int a = 0, b = item.getValues().size(); a < b; a++) {
										if (a > 0) {
											tempval += ",";
										}
										tempval += item.getValues().get(a);
									}
								}
								tempval += "]";

								myresult2 += "\"" + item.getName() + "\":"
										+ tempval;

								break;
							case Item.RICHTEXT:
								// TODO
								myresult2 += "\"" + item.getName() + "\":null";
								break;
							default:
								tempval = "";
							
								if(item.getValues() != null){
									if(item.getValues().size() > 1){
										tempval = "[";
									}
								}
								
								if (item.getText().equals("")) {
									tempval += "\"\"";
								} else {
									for (int a = 0, b = item.getValues().size(); a < b; a++) {
										if (a > 0) {
											tempval += ",";
										}
										tempval += "\""
												+ item.getValues().get(a)
												+ "\"";
									}
								}

								if(item.getValues() != null){
									if(item.getValues().size() > 1){
										tempval += "]";
									}
								}

								myresult2 += "\"" + item.getName() + "\":"
										+ tempval;
							}
						}
					}
					myresult2 += "}";
					index++;
					
					tempDoc = col.getNextDocument(doc);
					doc.recycle();
					doc = tempDoc;
				}
			}

			// Add NotesDocumentArray
			myresult2 += "]";
			myresult += ",\"Document\":" + myresult2;
		} catch (Exception e) {
			System.out.println("Error");
			e.printStackTrace();
			myresult = null;
		} finally {
			myresult += "}";
			return myresult;
		}
	}
	
	@SuppressWarnings("finally")
	private String _processSaveNotesDocument(JsonJavaObject json){
		String myresult = "";
		JsonJavaFactory factory = JsonJavaFactory.instanceEx;
		Document doc = null;
		
		try {
			Session ss = DominoUtils.getCurrentSession();
			Database db = ss.getDatabase(json.getString("serverName"), json
					.getString("filePath"));
			String myresult2 = "";

		      Iterator<String> vals = json.getJsonProperties();
		      while(vals.hasNext()) {
		    	  Object element = vals.next();
		    	  
		    	  if(element.equals("doc")){
		    		  JsonJavaObject jsonDoc = (JsonJavaObject) JsonParser.fromJson(factory,
		  					json.get(element.toString()).toString());
		    			
		    		  //We need to see if it's a new or existing document
		    		  if(jsonDoc.get("UniversalID").equals("")){
		    			  doc = db.createDocument();
		    			  
		    		  }else{
		    			  doc = db.getDocumentByUNID(jsonDoc.get("UniversalID").toString());
		    		  }
		    		 
		    		  if(doc != null){
			    		  Iterator<String> vals2 = jsonDoc.getJsonProperties();
			    		  while(vals2.hasNext()) {
					    	  Object element2 = vals2.next();
					    	  
					    	  if((!element2.equals("IsModified")) && (!element2.equals("UniversalID")) && (!element2.equals("NoteID"))){
					    		  doc.replaceItemValue(element2.toString(), jsonDoc.get(element2.toString()).toString());  
					    	  }
			    		  }
			    		  
			    		  //We get here...save the Doc, add the ids, and return
			    		  doc.save();
			    		  
			    		  if(jsonDoc.get("UniversalID").equals("")){
			    			  jsonDoc.putString("UniversalID", doc.getUniversalID()); 
			    		  }
			    		  
			    		  if(jsonDoc.get("NoteID").equals("")){
			    			  jsonDoc.putString("NoteID", doc.getNoteID()); 
			    		  } 
			    		  
			    		  myresult2 += jsonDoc.toString();
		    		  }else{
		    			  myresult2 = null;
		    		  }

		    		  break;
		    	  }
		      }			

			// Add NotesDocumentArray
			myresult += "\"Document\":" + myresult2;

		} catch (Exception e) {
			System.out.println("Error");
			e.printStackTrace();
			myresult = null;
		} finally {
			myresult += "}";
			return myresult;
		}
	}
}
