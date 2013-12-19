package com.ukuvma.tidomino.sample;

import java.io.Serializable;
import java.io.StringWriter;

import lotus.domino.Database;
import lotus.domino.Document;
import lotus.domino.Name;
import lotus.domino.Session;
import lotus.domino.View;

import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.commons.util.io.json.JsonParser;
import com.ibm.xsp.model.domino.DominoUtils;

public class ClientController implements Serializable {
	private static final long serialVersionUID = -3034980589027266431L;

	@SuppressWarnings("finally")
	public String processCRMRequest(String jsonText) {
		// VARIABLES
		StringWriter sw = new StringWriter();
		String myresult = "";
		String tempResult = "";

		try {
			JsonJavaFactory factory = JsonJavaFactory.instanceEx;
			JsonJavaObject json = (JsonJavaObject) JsonParser.fromJson(factory,
					jsonText);

			switch (Integer.parseInt(json.getString("key"))) {
			case 1:
				tempResult = _getActiveClients();
				break;
			}

			if (tempResult == null) {
				myresult = '{'
						+ "\"success\":false"
						+ ",\"description\":\"Java Error: _processNotesDocumentCollection()\""
						+ "}";
			} else {
				myresult = "{" + "\"success\":true"
						+ ",\"description\":\"Passed\"" + ",\"Data\":"
						+ tempResult + "}";
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
	private String _getActiveClients() {
		// CONSTANTS
		String VIEW_CLIENTS = "Mobile_Clients";

		// VARIABLES
		String myresult = "{";
		String myresult2 = "";
		int docIndex = 0;
		Document tempDoc = null;

		try {
			Session ss = DominoUtils.getCurrentSession();
			Database db = ss.getCurrentDatabase();
			View view = db.getView(VIEW_CLIENTS);
			Document doc = view.getFirstDocument();

			// Loop Through Active Clients and Create JSON Array
			Name username = null;

			while (doc != null) {
				if (docIndex > 0) {
					myresult2 += ",";
				}

				username = ss.createName(doc
						.getItemValueString("AccountManager"));

				myresult2 += "{" + "\"index\":" + docIndex + ",\"name\":\""
						+ doc.getItemValueString("ClientName") + "\""
						+ ",\"headOffice\":\"" + doc.getItemValueString("HeadOffice")
						+ "\"" + ",\"regNo\":\"" + doc.getItemValueString("ClientRegNo")
						+ "\"" + ",\"accountManager\":\""
						+ username.getCommon()
						+ "\"" + ",\"accNo\":\""
						+ doc.getItemValueString("AccountNumber") + "\""
						+ ",\"contact\":\"" + doc.getItemValueString("ContactNumber") + "\""
						+ "}";

				docIndex++;
				tempDoc = view.getNextDocument(doc);
				doc.recycle();
				doc = tempDoc;
			}

			// Finalise JSON Object
			myresult += "\"Count\":" + String.valueOf(docIndex);
			myresult += ",\"Companies\":[" + myresult2 + "]";

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
