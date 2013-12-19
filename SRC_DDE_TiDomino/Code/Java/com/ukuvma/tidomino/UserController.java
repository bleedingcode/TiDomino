package com.ukuvma.tidomino;

import java.io.Serializable;
import java.io.StringWriter;

import javax.faces.context.FacesContext;

import lotus.domino.Name;
import lotus.domino.Session;

import com.ibm.designer.runtime.directory.DirectoryUser;
import com.ibm.xsp.designer.context.XSPContext;
import com.ibm.xsp.model.domino.DominoUtils;

public class UserController implements Serializable {
	private static final long serialVersionUID = 7898324332420495351L;

	@SuppressWarnings("finally")
	public String getUserDetails() {
		Session ss = DominoUtils.getCurrentSession();
		FacesContext facesContext = FacesContext.getCurrentInstance();
		XSPContext context = XSPContext.getXSPContext(facesContext);
		StringWriter sw = new StringWriter();
		String myresult = "";

		try {
			DirectoryUser dirUser = context.getUser();
			Name username = ss.createName(dirUser.getDistinguishedName());

			// Set up Roles for User
			String roleList = "[";

			for (int x = 0, y = dirUser.getRoles().size(); x < y; x++) {
				if (x > 0) {
					roleList += ",";
				}
				roleList += "\"" + dirUser.getRoles().get(x).toString() + "\"";
			}

			roleList += "]";

			// Set up Groups for User
			String groupList = "[";
			for (int x = 0, y = dirUser.getGroups().size(); x < y; x++) {
				if (x > 0) {
					groupList += ",";
				}
				groupList += "\"" + dirUser.getGroups().get(x).toString()
						+ "\"";
			}
			groupList += "]";

			String tempUsername = "{" + "\"Common\":\"" + username.getCommon()
					+ "\"" + ",\"Abbreviated\":\"" + username.getAbbreviated()
					+ "\"" + ",\"Canonical\":\"" + username.getCanonical()
					+ "\"" + ",\"EmailAddress\":\"" + dirUser.getMail() + "\""
					+ ",\"Roles\":" + roleList + ",\"Groups\":" + groupList
					+ "}";

			myresult = "{" + "\"success\":true" + ",\"description\":\"Passed\""
					+ ",\"NotesUserObject\":" + tempUsername + "}";
		} catch (Exception e) {
			e.printStackTrace();
			myresult = '{' + "\"success\":false"
					+ ",\"description\":\"Java Error: getUserDetails()\"" + "}";
		} finally {
			sw.write(myresult);
			return sw.toString();
		}
	}
}
