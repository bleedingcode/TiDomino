package com.ukuvma.tidomino;

import java.io.IOException;
import java.io.Serializable;
import java.io.StringWriter;

import javax.faces.context.FacesContext;
import javax.faces.context.ResponseWriter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class MainController implements Serializable {
	private static final long serialVersionUID = 2633686739314591528L;

	public void processRequest(int key) throws IOException {
		// VARIABLES
		String DOM_OBJECT_PARAM = "key";
		FacesContext facesContext = FacesContext.getCurrentInstance();
		HttpServletResponse response = (HttpServletResponse) facesContext
				.getExternalContext().getResponse();
		ResponseWriter out = facesContext.getResponseWriter();
		response.setContentType("application/json");

		StringWriter sw = new StringWriter();
		String returnVal = "";

		try {
			switch (key) {
			case 1:
				UserController user = new UserController();
				returnVal = user.getUserDetails();
				break;

			case 2:
				DomController dom = new DomController();
				HttpServletRequest request = (HttpServletRequest) facesContext
						.getExternalContext().getRequest();
				returnVal = dom.processObjectRequest(request
						.getParameter(DOM_OBJECT_PARAM));
				break;
			}

			sw.write(returnVal);
			// response.setStatus(200);
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			out.write(sw.toString());
			facesContext.responseComplete();
		}
	}
}
